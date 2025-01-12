import { MongoClient, Collection } from 'mongodb';
import { 
    IGameState, 
    IGameMove, 
    IPlayer,
    GameMetadata,
    Player,
    IScores
} from '../shared';
import { GameLogicService } from './GameLogicService';
import { logger } from '../utils/logger';

export class GameService {
    private gamesCollection: Collection<GameMetadata>;
    private mongoClient: MongoClient;

    constructor(
        private readonly mongoUrl: string = process.env.MONGODB_URL || 'mongodb://localhost:27017'
    ) {
        // Инициализация будет выполнена при первом запросе
    }

    private initialized = false;
    private initializationPromise: Promise<void> | null = null;

    private async ensureInitialized() {
        if (this.initialized) return;

        logger.debug('Initializing GameService', {
            component: 'GameService',
            context: {
                mongoUrl: this.mongoUrl
            }
        });

        if (!this.initializationPromise) {
            this.initializationPromise = this.initializeDatabase().then(() => {
                this.initialized = true;
                logger.info('GameService initialized successfully', {
                    component: 'GameService'
                });
            });
        }
        await this.initializationPromise;
    }

    private async initializeDatabase() {
        const maxRetries = 5;
        const retryDelay = 5000; // 5 seconds
        
        for (let i = 0; i < maxRetries; i++) {
            try {
                logger.info(`Initializing MongoDB connection`, {
                    component: 'Database',
                    context: {
                        attempt: i + 1,
                        maxRetries,
                        mongoUrl: this.mongoUrl
                    }
                });

                this.mongoClient = new MongoClient(this.mongoUrl, {
                    serverSelectionTimeoutMS: 5000,
                    connectTimeoutMS: 10000,
                });
                
                await this.mongoClient.connect();
                logger.info('MongoDB connection established', {
                    component: 'Database'
                });
                
                this.gamesCollection = this.mongoClient.db('ctorgame').collection<GameMetadata>('games');
                
                // Create indexes
                await this.gamesCollection.createIndex({ code: 1 }, { unique: true });
                await this.gamesCollection.createIndex({ status: 1 });
                await this.gamesCollection.createIndex({ startTime: 1 });
                await this.gamesCollection.createIndex({ lastActivityAt: 1 });
                await this.gamesCollection.createIndex({ gameId: 1 });
                
                logger.info('MongoDB indexes created', {
                    component: 'Database',
                    context: {
                        indexes: ['code', 'status', 'startTime', 'lastActivityAt', 'gameId']
                    }
                });
                return; // Success - exit the retry loop
            } catch (error) {
                logger.error('MongoDB connection failed', {
                    component: 'Database',
                    context: {
                        attempt: i + 1,
                        maxRetries,
                        retryDelay
                    },
                    error
                });

                if (i < maxRetries - 1) {
                    logger.info(`Scheduling retry`, {
                        component: 'Database',
                        context: {
                            nextAttempt: i + 2,
                            delaySeconds: retryDelay/1000
                        }
                    });
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                } else {
                    logger.error('Max MongoDB connection retries reached', {
                        component: 'Database',
                        error
                    });
                    throw error;
                }
            }
        }
    }

    async createGame(gameId: string, player: IPlayer, initialState: IGameState): Promise<GameMetadata> {
        const startTime = Date.now();
        await this.ensureInitialized();
        
        logger.game.state('creating', initialState, {
            gameId,
            playerId: player.id
        });

        const normalizedGameId = gameId.toUpperCase();
        let code: string;
        let exists: GameMetadata | null;
        let attempts = 0;
        
        do {
            code = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            exists = await this.gamesCollection.findOne({ code });
            attempts++;
            
            logger.debug('Generated game code', {
                component: 'GameService',
                context: {
                    gameId,
                    code,
                    attempt: attempts,
                    exists: !!exists
                }
            });
        } while (exists);

        const game: GameMetadata = {
            gameId: normalizedGameId,
            code,
            status: 'waiting',
            startTime: new Date().toISOString(),
            lastActivityAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            players: {
                first: player.id
            },
            totalTurns: 0,
            boardSize: initialState.board.size,
            currentState: initialState
        };

        await this.gamesCollection.insertOne(game);
        return game;
    }

    async findGame(gameIdOrCode: string): Promise<GameMetadata | null> {
        await this.ensureInitialized();
        const normalizedId = gameIdOrCode.toUpperCase();
        const result = await this.gamesCollection.findOne({ 
            $or: [
                { gameId: normalizedId, status: 'waiting' },
                { code: normalizedId, status: 'waiting' }
            ]
        });
        return result;
    }

    async joinGame(gameIdOrCode: string, player: IPlayer): Promise<GameMetadata> {
        await this.ensureInitialized();
        const normalizedId = gameIdOrCode.toUpperCase();
        const result = await this.gamesCollection.findOneAndUpdate(
            { 
                $or: [
                    { gameId: normalizedId, status: 'waiting' },
                    { code: normalizedId, status: 'waiting' }
                ]
            },
            { 
                $set: { 
                    'players.second': player.id,
                    status: 'playing',
                    lastActivityAt: new Date().toISOString(),
                }
            },
            { returnDocument: 'after' }
        );

        if (!result) {
            throw new Error('Game not found or already completed');
        }

        return result;
    }

    async makeMove(gameId: string, playerNumber: number, move: IGameMove): Promise<GameMetadata> {
        const startTime = Date.now();
        await this.ensureInitialized();
        
        logger.game.move('processing', move, {
            gameId,
            playerNumber,
            timestamp: new Date().toISOString()
        });

        const game = await this.gamesCollection.findOne({ gameId });
        if (!game || !game.currentState) {
            const error = new Error('Game not found or invalid state');
            logger.game.validation(false, 'game_not_found', {
                gameId,
                exists: !!game,
                hasState: !!game?.currentState
            });
            throw error;
        }

        if (game.status === 'finished') {
            const error = new Error('Game is already completed');
            logger.game.validation(false, 'game_finished', {
                gameId,
                status: game.status
            });
            throw error;
        }

        // Применяем ход и получаем новое состояние
        const newState = GameLogicService.applyMove(game.currentState, move, playerNumber);

        // Обновляем состояние игры
        const now = new Date().toISOString();
        const updateData: Partial<GameMetadata> = { 
            currentState: newState,
            lastActivityAt: now,
            status: newState.gameOver ? 'finished' : 'playing',
            totalTurns: (game.totalTurns || 0) + 1,
            currentPlayer: newState.currentPlayer
        };

        if (newState.gameOver) {
            updateData.endTime = now;
            updateData.winner = newState.winner || undefined;
            updateData.finalScore = newState.scores;
            updateData.duration = (new Date(now).getTime() - new Date(game.startTime).getTime()) / 1000;
        }

        const result = await this.gamesCollection.findOneAndUpdate(
            { gameId },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        if (!result) {
            const error = new Error('Failed to update game state');
            logger.error('State update failed', {
                component: 'GameService',
                context: {
                    gameId,
                    move
                },
                error
            });
            throw error;
        }

        const duration = Date.now() - startTime;
        logger.game.performance('make_move', duration, {
            gameId,
            move,
            success: true
        });

        logger.game.state('updated', result.currentState, {
            gameId,
            playerNumber,
            move,
            duration
        });

        return result;
    }

    async getGameState(gameId: string): Promise<IGameState | null> {
        await this.ensureInitialized();
        const game = await this.gamesCollection.findOne({ gameId });
        return game?.currentState || null;
    }

    async getPlayer(gameId: string, playerId: string): Promise<IPlayer | null> {
        await this.ensureInitialized();
        const game = await this.gamesCollection.findOne({ gameId });
        if (!game) return null;
        
        if (game.players.first === playerId) {
            return { id: playerId, number: Player.First };
        } else if (game.players.second === playerId) {
            return { id: playerId, number: Player.Second };
        }
        return null;
    }

    async getSavedGames(): Promise<GameMetadata[]> {
        await this.ensureInitialized();
        return this.gamesCollection.find({
            status: 'finished'
        }).sort({ endTime: -1 }).limit(50).toArray();
    }

    async getGameHistory(gameId: string): Promise<number> {
        await this.ensureInitialized();
        const game = await this.gamesCollection.findOne({ gameId });
        if (!game) return 0;
        return game.currentState?.currentTurn.moves.length || 0;
    }

    async getGameStateAtMove(gameId: string, moveNumber: number): Promise<IGameState | null> {
        await this.ensureInitialized();
        const game = await this.gamesCollection.findOne({ gameId });
        if (!game || !game.currentState) return null;
        return game.currentState;
    }

    async finishGame(gameId: string, winner: Player | null, scores: IScores): Promise<void> {
        await this.ensureInitialized();
        const now = new Date().toISOString();
        const game = await this.gamesCollection.findOne({ gameId });
        if (!game) return;

        await this.gamesCollection.updateOne(
            { gameId },
            {
                $set: {
                    status: 'finished',
                    endTime: now,
                    lastActivityAt: now,
                    winner: winner !== null ? winner : undefined,
                    finalScore: scores,
                    duration: (new Date(now).getTime() - new Date(game.startTime).getTime()) / 1000
                }
            }
        );
    }

    async disconnect(): Promise<void> {
        await this.mongoClient?.close();
    }
}