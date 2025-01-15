import type {
    IGameState,
    IPlayer,
    IGameMove,
    PlayerNumber,
    IGameScores
} from '@ctor-game/shared/types/game/types';
import { GameStatus } from '@ctor-game/shared/types/game/types';
import type { IGameHistory, IGameHistorySummary } from '@ctor-game/shared/types/storage/history';

import type {
    GameMetadata,
    GameDetails
} from '@ctor-game/shared/types/storage/metadata';

import { GameLogicService } from './GameLogicService';
import { GameStorageService } from './GameStorageService';
import { EventService } from './EventService';
import { RedisService } from './RedisService';
import { logger } from '../utils/logger';
import { toErrorWithStack } from '@ctor-game/shared/utils/errors';

export class GameServiceError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'GameServiceError';
    }
}

/**
 * Main service for game operations, coordinating between storage, Redis, and events
 */
export class GameService {
    private initialized = false;
    private initializationPromise: Promise<void> | null = null;

    constructor(
        private readonly storageService: GameStorageService,
        private readonly eventService: EventService,
        private readonly redisService: RedisService
    ) {}

    async initialize(): Promise<void> {
        if (this.initialized) return;

        if (!this.initializationPromise) {
            const startTime = Date.now();
            this.initializationPromise = Promise.all([
                this.storageService.connect(),
                this.redisService.connect()
            ]).then(() => {
                this.initialized = true;
                logger.info('GameService initialized successfully', {
                    component: 'GameService',
                    duration: Date.now() - startTime
                });
            });
        }
        await this.initializationPromise;
    }

    private async ensureInitialized(): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }
    }

    async createGame(playerId: string, gameId: string): Promise<GameMetadata> {
        const startTime = Date.now();
        await this.ensureInitialized();

        try {
            // Generate game code (from old version)
            let code: string;
            let exists: GameMetadata | null;
            do {
                code = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
                exists = await this.storageService.findGameByCode(code);
            } while (exists);

            // Create initial game state
            const initialState = GameLogicService.createInitialState();
            
            // Create game in storage with code
            const game = await this.storageService.createGame(playerId, gameId);
            
            // Store state in Redis
            await this.redisService.setGameState(gameId, initialState);
            
            // Create game event
            await this.eventService.createGameCreatedEvent(gameId, GameStatus.WAITING);

            logger.info('game_created', {
                component: 'GameService',
                gameId,
                playerId,
                code,
                duration: Date.now() - startTime
            });

            return game;
        } catch (error) {
            logger.error('Failed to create game', {
                component: 'GameService',
                error: toErrorWithStack(error),
                gameId,
                playerId,
                duration: Date.now() - startTime
            });
            const errMsg = error instanceof Error ? error.message : 'Unknown error';
            throw new GameServiceError(`Failed to create game: ${errMsg}`);
        }
    }

    async findGame(gameIdOrCode: string): Promise<GameMetadata | null> {
        await this.ensureInitialized();
        return this.storageService.findGameByCode(gameIdOrCode);
    }

    async joinGame(gameId: string, playerId: string): Promise<GameMetadata> {
        const startTime = Date.now();
        await this.ensureInitialized();

        try {
            // Join game in storage
            const game = await this.storageService.joinGame(gameId, playerId);
            
            // Get current state from Redis
            const state = await this.redisService.getGameState(gameId);
            if (!state) {
                throw new GameServiceError('Game state not found');
            }

            // Create player joined event
            await this.eventService.createPlayerConnectedEvent(gameId, playerId, 2 as PlayerNumber);

            // If game is now full, create game started event
            if (game.players.first && game.players.second) {
                await this.eventService.createGameStartedEvent(gameId, state);
            }

            logger.info('game_joined', {
                component: 'GameService',
                gameId,
                playerId,
                duration: Date.now() - startTime
            });

            return game;
        } catch (error) {
            logger.error('Failed to join game', {
                component: 'GameService',
                error: toErrorWithStack(error),
                gameId,
                playerId,
                duration: Date.now() - startTime
            });
            const errMsg = error instanceof Error ? error.message : 'Unknown error';
            throw new GameServiceError(`Failed to join game: ${errMsg}`);
        }
    }

    async makeMove(gameId: string, playerNumber: PlayerNumber, move: IGameMove): Promise<IGameState> {
        const startTime = Date.now();
        await this.ensureInitialized();

        try {
            // Get current state
            const currentState = await this.redisService.getGameState(gameId);
            if (!currentState) {
                throw new GameServiceError('Game state not found');
            }

            // Validate and apply move
            if (!GameLogicService.isValidMove(currentState, move, playerNumber)) {
                throw new GameServiceError('Invalid move');
            }

            const newState = GameLogicService.applyMove(currentState, move, playerNumber);

            // Update state in Redis
            await this.redisService.setGameState(gameId, newState);

            // Record move in storage
            await this.storageService.recordMove(gameId, move);

            // Create move event
            await this.eventService.createGameMoveEvent(gameId, playerNumber, move, newState);

            // Check for game end
            if (newState.gameOver) {
                const scores: IGameScores = {
                    player1: newState.scores.player1,
                    player2: newState.scores.player2
                };
                await this.finishGame(gameId, newState.winner as PlayerNumber, scores);
            }

            logger.info('move_made', {
                component: 'GameService',
                gameId,
                playerNumber,
                moveType: move.type,
                duration: Date.now() - startTime
            });

            return newState;
        } catch (error) {
            logger.error('Failed to make move', {
                component: 'GameService',
                error: toErrorWithStack(error),
                gameId,
                playerNumber,
                move,
                duration: Date.now() - startTime
            });
            const errMsg = error instanceof Error ? error.message : 'Unknown error';
            throw new GameServiceError(`Failed to make move: ${errMsg}`);
        }
    }

    async finishGame(
        gameId: string,
        winner: PlayerNumber,
        scores: IGameScores
    ): Promise<void> {
        const startTime = Date.now();
        await this.ensureInitialized();

        try {
            // Update storage
            await this.storageService.finishGame(gameId, winner, scores);

            // Create game ended event
            const state = await this.redisService.getGameState(gameId);
            await this.eventService.createGameEndedEvent(gameId, winner, state);

            // Clean up Redis state (keep for a while for potential analysis)
            await this.redisService.expireGameState(gameId, 3600); // 1 hour

            logger.info('game_finished', {
                component: 'GameService',
                gameId,
                winner,
                scores,
                duration: Date.now() - startTime
            });
        } catch (error) {
            logger.error('Failed to finish game', {
                component: 'GameService',
                error: toErrorWithStack(error),
                gameId,
                winner,
                scores,
                duration: Date.now() - startTime
            });
            const errMsg = error instanceof Error ? error.message : 'Unknown error';
            throw new GameServiceError(`Failed to finish game: ${errMsg}`);
        }
    }

    async getSavedGames(): Promise<IGameHistorySummary[]> {
        await this.ensureInitialized();
        return this.storageService.getSavedGames();
    }

    async getGameHistory(gameId: string): Promise<IGameHistory> {
        await this.ensureInitialized();
        return this.storageService.getGameHistory(gameId);
    }

    async getGameStateAtMove(gameId: string, moveNumber: number): Promise<IGameState | null> {
        await this.ensureInitialized();
        const history = await this.getGameHistory(gameId);
        
        if (moveNumber < 0 || moveNumber >= history.moves.length) {
            return null;
        }

        // Rebuild game state up to the requested move
        let state = GameLogicService.createInitialState();
        for (let i = 0; i <= moveNumber; i++) {
            const move = history.moves[i];
            const playerNumber = i % 2 === 0 ? 1 : 2;
            state = GameLogicService.applyMove(state, move, playerNumber as PlayerNumber);
        }

        return state;
    }

    async expireGame(gameId: string): Promise<void> {
        const startTime = Date.now();
        await this.ensureInitialized();

        try {
            // Get current state before expiring
            const state = await this.redisService.getGameState(gameId);
            
            // Create expired event
            await this.eventService.createGameExpiredEvent(gameId);
            
            // Clean up Redis state
            await this.redisService.deleteGameState(gameId);

            // Update storage status
            await this.storageService.markGameExpired(gameId);

            logger.info('game_expired', {
                component: 'GameService',
                gameId,
                state,
                duration: Date.now() - startTime
            });
        } catch (error) {
            logger.error('Failed to expire game', {
                component: 'GameService',
                error: toErrorWithStack(error),
                gameId,
                duration: Date.now() - startTime
            });
            const errMsg = error instanceof Error ? error.message : 'Unknown error';
            throw new GameServiceError(`Failed to expire game: ${errMsg}`);
        }
    }

    async disconnect(): Promise<void> {
        await Promise.all([
            this.storageService.disconnect(),
            this.redisService.disconnect()
        ]);
        this.initialized = false;
        this.initializationPromise = null;
    }
}