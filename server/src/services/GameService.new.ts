import { MongoClient, Collection } from 'mongodb';

// Import new types
import type { 
    IGameState, 
    PlayerNumber 
} from '@ctor-game/shared/src/types/game/types.js';
import type { IPlayer } from '@ctor-game/shared/src/types/game/players.js';
import type { IGameMove } from '@ctor-game/shared/src/types/game/types.js';
import type { GameMetadata } from '@ctor-game/shared/src/types/storage/types.js';

// Service imports
import { GameLogicService } from './GameLogicService.js';
import { EventService } from './EventService.js';
import { RedisService } from './RedisService.js';
import { logger } from '../utils/logger.js';
import { toErrorWithStack } from '../types/error.js';

export class GameService {
    private gamesCollection!: Collection<GameMetadata>;
    private mongoClient!: MongoClient;
    private initialized = false;
    private initializationPromise: Promise<void> | null = null;

    constructor(
        private readonly mongoUrl: string = process.env.MONGODB_URL || 'mongodb://localhost:27017',
        private readonly eventService: EventService,
        private readonly redisService: RedisService
    ) {}

    private async ensureInitialized() {
        if (this.initialized) return;

        if (!this.initializationPromise) {
            this.initializationPromise = this.initializeDatabase().then(() => {
                this.initialized = true;
                logger.info('GameService initialized successfully');
            });
        }
        await this.initializationPromise;
    }

    private async initializeDatabase() {
        const maxRetries = 5;
        const retryDelay = 5000;
        
        for (let i = 0; i < maxRetries; i++) {
            try {
                logger.info(`Initializing MongoDB connection`, {
                    attempt: i + 1,
                    maxRetries
                });

                this.mongoClient = new MongoClient(this.mongoUrl, {
                    serverSelectionTimeoutMS: 5000,
                    connectTimeoutMS: 10000,
                });
                
                await this.mongoClient.connect();
                this.gamesCollection = this.mongoClient.db('ctorgame').collection<GameMetadata>('games');
                
                // Create indexes
                await Promise.all([
                    this.gamesCollection.createIndex({ gameId: 1 }, { unique: true }),
                    this.gamesCollection.createIndex({ status: 1 }),
                    this.gamesCollection.createIndex({ startTime: 1 }),
                    this.gamesCollection.createIndex({ lastActivityAt: 1 })
                ]);
                
                return;
            } catch (error) {
                logger.error('MongoDB connection failed', {
                    attempt: i + 1,
                    error: toErrorWithStack(error)
                });

                if (i < maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                } else {
                    throw error;
                }
            }
        }
    }

    async createGame(gameId: string, player: IPlayer, initialState: IGameState): Promise<GameMetadata> {
        await this.ensureInitialized();
        
        // Create game event
        const event = await this.eventService.createGameCreatedEvent(gameId, 'waiting');
        
        const game: GameMetadata = {
            gameId,
            status: 'waiting',
            startTime: new Date().toISOString(),
            lastActivityAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            players: [player],
            currentState: initialState,
            events: [event.id]
        };

        await Promise.all([
            this.gamesCollection.insertOne(game),
            this.redisService.setGameState(gameId, initialState)
        ]);

        return game;
    }

    async joinGame(gameId: string, player: IPlayer): Promise<GameMetadata> {
        await this.ensureInitialized();

        const game = await this.gamesCollection.findOne({ gameId, status: 'waiting' });
        if (!game) {
            throw new Error('Game not found or already started');
        }

        if (game.players.length >= 2) {
            throw new Error('Game is full');
        }

        // Create player connected event
        const connectEvent = await this.eventService.createPlayerConnectedEvent(
            gameId,
            player.id,
            player.number
        );

        // Update game state
        const result = await this.gamesCollection.findOneAndUpdate(
            { gameId },
            { 
                $set: { status: 'playing', lastActivityAt: new Date().toISOString() },
                $push: { 
                    players: player,
                    events: connectEvent.id
                }
            },
            { returnDocument: 'after' }
        );

        if (!result) {
            throw new Error('Failed to update game');
        }

        // Create game started event
        if (result.players.length === 2) {
            const startEvent = await this.eventService.createGameStartedEvent(
                gameId,
                result.currentState
            );
            
            await this.gamesCollection.updateOne(
                { gameId },
                { $push: { events: startEvent.id } }
            );
        }

        return result;
    }

    async makeMove(gameId: string, playerNumber: PlayerNumber, move: IGameMove): Promise<IGameState> {
        await this.ensureInitialized();
        
        const game = await this.gamesCollection.findOne({ gameId });
        if (!game) {
            throw new Error('Game not found');
        }

        if (game.status === 'finished') {
            throw new Error('Game is already finished');
        }

        // Apply move
        const newState = GameLogicService.applyMove(game.currentState, move, playerNumber);

        // Create move event
        const moveEvent = await this.eventService.createGameMoveEvent(
            gameId,
            game.players.find(p => p.number === playerNumber)?.id || '',
            move,
            newState
        );

        // Update game state
        const updateData: Partial<GameMetadata> = {
            currentState: newState,
            lastActivityAt: new Date().toISOString(),
            status: newState.status,
            events: [...(game.events || []), moveEvent.id]
        };

        if (newState.status === 'finished') {
            const winner = newState.scores.player1 > newState.scores.player2 ? 1 : 2;
            const endEvent = await this.eventService.createGameEndedEvent(
                gameId,
                winner as PlayerNumber,
                newState
            );
            updateData.events.push(endEvent.id);
            updateData.endTime = new Date().toISOString();
            updateData.winner = winner;
            updateData.finalState = newState;
        }

        const result = await this.gamesCollection.findOneAndUpdate(
            { gameId },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        if (!result) {
            throw new Error('Failed to update game state');
        }

        return newState;
    }

    async finishGame(gameId: string, winner: PlayerNumber | null): Promise<void> {
        await this.ensureInitialized();

        const game = await this.gamesCollection.findOne({ gameId });
        if (!game) return;

        // Create game ended event
        const endEvent = await this.eventService.createGameEndedEvent(
            gameId,
            winner,
            game.currentState
        );

        await this.gamesCollection.updateOne(
            { gameId },
            {
                $set: {
                    status: 'finished',
                    endTime: new Date().toISOString(),
                    lastActivityAt: new Date().toISOString(),
                    winner,
                    finalState: game.currentState
                },
                $push: { events: endEvent.id }
            }
        );
    }

    async expireGame(gameId: string): Promise<void> {
        await this.ensureInitialized();

        const game = await this.gamesCollection.findOne({ gameId });
        if (!game) return;

        // Create game expired event
        const expireEvent = await this.eventService.createGameExpiredEvent(gameId);

        await this.gamesCollection.updateOne(
            { gameId },
            {
                $set: {
                    status: 'finished',
                    endTime: new Date().toISOString(),
                    lastActivityAt: new Date().toISOString(),
                    finalState: game.currentState
                },
                $push: { events: expireEvent.id }
            }
        );
    }

    async getGameState(gameId: string): Promise<IGameState | null> {
        await this.ensureInitialized();
        const game = await this.gamesCollection.findOne({ gameId });
        return game?.currentState || null;
    }

    async getGameEvents(gameId: string): Promise<string[]> {
        await this.ensureInitialized();
        const game = await this.gamesCollection.findOne({ gameId });
        return game?.events || [];
    }

    async disconnect(): Promise<void> {
        await this.mongoClient?.close();
    }
}