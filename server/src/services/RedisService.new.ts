import Redis from 'ioredis';
import type {
    IGameState,
    IGameMove,
    PlayerNumber,
    UUID,
    GameStatus
} from '@ctor-game/shared/types/core/base.js';

import type {
    IRedisConfig,
    IRedisTTL,
    IRedisGameState,
    IRedisPlayerSession,
    IRedisGameRoom,
    IRedisGameEvent,
    REDIS_KEYS
} from '@ctor-game/shared/types/storage/redis.new.js';

import { GameLogicService } from './GameLogicService.new.js';
import { logger } from '../utils/logger.js';

/**
 * Lock manager for Redis operations
 */
class RedisLock {
    constructor(private readonly redis: Redis) {}

    async acquire(key: string, timeout: number = 5000): Promise<boolean> {
        const lockId = crypto.randomUUID();
        const acquired = await this.redis.set(
            `lock:${key}`,
            lockId,
            'NX',
            'PX',
            timeout
        );
        return acquired === 'OK';
    }

    async release(key: string): Promise<void> {
        await this.redis.del(`lock:${key}`);
    }
}

export class RedisService {
    private readonly redis: Redis;
    private readonly lock: RedisLock;
    private readonly config: IRedisConfig;
    private readonly ttl: IRedisTTL;

    constructor(config: IRedisConfig, ttl: IRedisTTL) {
        this.config = config;
        this.ttl = ttl;
        this.redis = new Redis(config);
        this.lock = new RedisLock(this.redis);

        // Setup error handler
        this.redis.on('error', (error) => {
            logger.error('Redis error', {
                component: 'RedisService',
                error
            });
        });
    }

    /**
     * Game State Management
     */
    async setGameState(gameId: UUID, state: IGameState): Promise<void> {
        const redisState: IRedisGameState = {
            ...state,
            lastUpdate: Date.now(),
            version: (state as IRedisGameState).version ?? 0 + 1
        };

        await this.withLock(gameId, async () => {
            await this.redis
                .multi()
                .set(
                    REDIS_KEYS.GAME_STATE(gameId),
                    JSON.stringify(redisState),
                    'EX',
                    this.ttl.gameState
                )
                .publish('game:state:updated', JSON.stringify({ gameId, state: redisState }))
                .exec();
        });
    }

    async getGameState(gameId: UUID): Promise<IGameState | null> {
        const data = await this.redis.get(REDIS_KEYS.GAME_STATE(gameId));
        if (!data) return null;

        const redisState = JSON.parse(data) as IRedisGameState;
        // Remove Redis-specific fields
        const { lastUpdate, version, ...gameState } = redisState;
        return gameState;
    }

    async updateGameState(
        gameId: UUID,
        playerNumber: PlayerNumber,
        move: IGameMove,
        validateMove: boolean = true
    ): Promise<IGameState> {
        return await this.withLock(gameId, async () => {
            const state = await this.getGameState(gameId);
            if (!state) throw new Error('Game state not found');

            if (validateMove) {
                const isValid = GameLogicService.isValidMove(state, move, playerNumber);
                if (!isValid) throw new Error('Invalid move');
            }

            const newState = GameLogicService.applyMove(state, move, playerNumber);
            await this.setGameState(gameId, newState);

            // Add move to event history
            await this.addGameEvent({
                id: crypto.randomUUID(),
                gameId,
                type: 'move',
                timestamp: Date.now(),
                playerNumber,
                data: { move, state: newState }
            });

            return newState;
        });
    }

    /**
     * Player Session Management
     */
    async setPlayerSession(
        socketId: UUID,
        gameId: UUID,
        playerNumber: PlayerNumber,
        reconnectTimeout?: number
    ): Promise<void> {
        const session: IRedisPlayerSession = {
            gameId,
            playerNumber,
            lastActivity: Date.now(),
            reconnectUntil: reconnectTimeout ? Date.now() + reconnectTimeout : undefined
        };

        await this.redis.setex(
            REDIS_KEYS.PLAYER_SESSION(socketId),
            this.ttl.playerSession,
            JSON.stringify(session)
        );
    }

    async getPlayerSession(socketId: UUID): Promise<IRedisPlayerSession | null> {
        const data = await this.redis.get(REDIS_KEYS.PLAYER_SESSION(socketId));
        return data ? JSON.parse(data) : null;
    }

    /**
     * Game Room Management
     */
    async createGameRoom(gameId: UUID, playerId: UUID, playerNumber: PlayerNumber): Promise<void> {
        const room: IRedisGameRoom = {
            gameId,
            status: 'waiting',
            players: [{
                id: playerId,
                number: playerNumber
            }],
            lastUpdate: Date.now()
        };

        await this.redis.setex(
            REDIS_KEYS.GAME_ROOM(gameId),
            this.ttl.gameRoom,
            JSON.stringify(room)
        );
    }

    async joinGameRoom(gameId: UUID, playerId: UUID, playerNumber: PlayerNumber): Promise<void> {
        await this.withLock(gameId, async () => {
            const room = await this.getGameRoom(gameId);
            if (!room) throw new Error('Game room not found');
            if (room.players.length >= 2) throw new Error('Game room is full');

            const updatedRoom: IRedisGameRoom = {
                ...room,
                status: 'playing',
                players: [...room.players, { id: playerId, number: playerNumber }],
                lastUpdate: Date.now()
            };

            await this.redis.setex(
                REDIS_KEYS.GAME_ROOM(gameId),
                this.ttl.gameRoom,
                JSON.stringify(updatedRoom)
            );

            await this.addGameEvent({
                id: crypto.randomUUID(),
                gameId,
                type: 'join',
                timestamp: Date.now(),
                playerNumber,
                data: {}
            });
        });
    }

    async getGameRoom(gameId: UUID): Promise<IRedisGameRoom | null> {
        const data = await this.redis.get(REDIS_KEYS.GAME_ROOM(gameId));
        return data ? JSON.parse(data) : null;
    }

    /**
     * Event Management
     */
    async addGameEvent(event: IRedisGameEvent): Promise<void> {
        await this.redis
            .multi()
            .lpush(REDIS_KEYS.GAME_EVENTS(event.gameId), JSON.stringify(event))
            .ltrim(REDIS_KEYS.GAME_EVENTS(event.gameId), 0, 99) // Keep last 100 events
            .expire(REDIS_KEYS.GAME_EVENTS(event.gameId), this.ttl.eventQueue.default)
            .exec();
    }

    async getGameEvents(gameId: UUID, limit: number = 10): Promise<IRedisGameEvent[]> {
        const events = await this.redis.lrange(REDIS_KEYS.GAME_EVENTS(gameId), 0, limit - 1);
        return events.map(data => JSON.parse(data));
    }

    /**
     * Utility Methods
     */
    private async withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
        const acquired = await this.lock.acquire(key);
        if (!acquired) throw new Error('Failed to acquire lock');

        try {
            return await fn();
        } finally {
            await this.lock.release(key);
        }
    }

    async cleanup(): Promise<void> {
        await this.redis.quit();
    }
}