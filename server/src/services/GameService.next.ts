import { GameMove } from '@ctor-game/shared/types/game/moves.js';
import { IGameState } from '@ctor-game/shared/types/game/state.js';
import { Player } from '@ctor-game/shared/types/base/enums.js';
import { GameStatus } from '@ctor-game/shared/types/primitives.js';
import { GameMetadata } from '@ctor-game/shared/types/storage/metadata.new.js';

import { GameLogicService } from './GameLogicService.js';
import { GameStorageService } from './GameStorageService.new.js';
import { EventService } from './EventService.js';
import { RedisService } from './RedisService.new.js';
import { logger } from '../utils/logger.js';
import { toErrorWithStack } from '../types/error.js';

export class GameServiceError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'GameServiceError';
    }
}

/**
 * Main service for game operations, coordinating between storage, logic, and events
 */
export class GameService {
    constructor(
        private readonly storageService: GameStorageService,
        private readonly eventService: EventService,
        private readonly redisService: RedisService
    ) {}

    async initialize(): Promise<void> {
        const startTime = Date.now();
        try {
            await Promise.all([
                this.storageService.connect(),
                this.redisService.connect()
            ]);
            logger.info('GameService initialized successfully', {
                duration: Date.now() - startTime
            });
        } catch (error) {
            logger.error('Failed to initialize GameService', {
                error: toErrorWithStack(error),
                duration: Date.now() - startTime
            });
            throw new GameServiceError('Failed to initialize game service');
        }
    }

    async createGame(playerId: string, gameId: string): Promise<GameMetadata> {
        const startTime = Date.now();
        try {
            // Create initial game state
            const initialState = GameLogicService.createInitialState();
            
            // Create game in storage
            const game = await this.storageService.createGame(playerId, gameId);
            
            // Store state in Redis
            await this.redisService.setGameState(gameId, initialState);
            
            // Create game event
            await this.eventService.createGameCreatedEvent(gameId, GameStatus.WAITING);

            logger.game.info('game_created', {
                gameId,
                playerId,
                duration: Date.now() - startTime
            });

            return game;
        } catch (error) {
            logger.error('Failed to create game', {
                error: toErrorWithStack(error),
                gameId,
                playerId,
                duration: Date.now() - startTime
            });
            throw new GameServiceError(`Failed to create game: ${error.message}`);
        }
    }

    async joinGame(gameId: string, playerId: string): Promise<GameMetadata> {
        const startTime = Date.now();
        try {
            // Join game in storage
            const game = await this.storageService.joinGame(gameId, playerId);
            
            // Get current state from Redis
            const state = await this.redisService.getGameState(gameId);
            if (!state) {
                throw new GameServiceError('Game state not found');
            }

            // Create player joined event
            await this.eventService.createPlayerConnectedEvent(gameId, playerId, Player.Second);

            // If game is now full, create game started event
            if (game.players.first && game.players.second) {
                await this.eventService.createGameStartedEvent(gameId, state);
            }

            logger.game.info('game_joined', {
                gameId,
                playerId,
                duration: Date.now() - startTime
            });

            return game;
        } catch (error) {
            logger.error('Failed to join game', {
                error: toErrorWithStack(error),
                gameId,
                playerId,
                duration: Date.now() - startTime
            });
            throw new GameServiceError(`Failed to join game: ${error.message}`);
        }
    }

    async makeMove(gameId: string, player: Player, move: GameMove): Promise<IGameState> {
        const startTime = Date.now();
        try {
            // Get current state
            const currentState = await this.redisService.getGameState(gameId);
            if (!currentState) {
                throw new GameServiceError('Game state not found');
            }

            // Validate and apply move
            if (!GameLogicService.isValidMove(currentState, move, player)) {
                throw new GameServiceError('Invalid move');
            }

            const newState = GameLogicService.applyMove(currentState, move, player);

            // Update state in Redis
            await this.redisService.setGameState(gameId, newState);

            // Record move in storage
            await this.storageService.recordMove(gameId, move);

            // Create move event
            await this.eventService.createGameMoveEvent(gameId, player, move, newState);

            // Check for game end
            if (newState.gameOver) {
                await this.finishGame(gameId, newState.winner as Player, newState.scores);
            }

            logger.game.info('move_made', {
                gameId,
                player,
                moveType: move.type,
                duration: Date.now() - startTime
            });

            return newState;
        } catch (error) {
            logger.error('Failed to make move', {
                error: toErrorWithStack(error),
                gameId,
                player,
                move,
                duration: Date.now() - startTime
            });
            throw new GameServiceError(`Failed to make move: ${error.message}`);
        }
    }

    async finishGame(
        gameId: string,
        winner: Player,
        finalScore: { [Player.First]: number; [Player.Second]: number }
    ): Promise<void> {
        const startTime = Date.now();
        try {
            // Update storage
            await this.storageService.finishGame(gameId, winner, finalScore);

            // Create game ended event
            const state = await this.redisService.getGameState(gameId);
            await this.eventService.createGameEndedEvent(gameId, winner, state);

            // Clean up Redis state (keep for a while for potential analysis)
            await this.redisService.expireGameState(gameId, 3600); // 1 hour

            logger.game.info('game_finished', {
                gameId,
                winner,
                finalScore,
                duration: Date.now() - startTime
            });
        } catch (error) {
            logger.error('Failed to finish game', {
                error: toErrorWithStack(error),
                gameId,
                winner,
                finalScore,
                duration: Date.now() - startTime
            });
            throw new GameServiceError(`Failed to finish game: ${error.message}`);
        }
    }

    async expireGame(gameId: string): Promise<void> {
        const startTime = Date.now();
        try {
            // Get current state before expiring
            const state = await this.redisService.getGameState(gameId);
            
            // Create expired event
            await this.eventService.createGameExpiredEvent(gameId);
            
            // Clean up Redis state
            await this.redisService.deleteGameState(gameId);

            logger.game.info('game_expired', {
                gameId,
                state,
                duration: Date.now() - startTime
            });
        } catch (error) {
            logger.error('Failed to expire game', {
                error: toErrorWithStack(error),
                gameId,
                duration: Date.now() - startTime
            });
            throw new GameServiceError(`Failed to expire game: ${error.message}`);
        }
    }

    async disconnect(): Promise<void> {
        await Promise.all([
            this.storageService.disconnect(),
            this.redisService.disconnect()
        ]);
    }
}