import type { TTLConfig, TTLStrategy, GameStatus } from '@ctor-game/shared/types/redis/ttl.js';
import { redisClient, REDIS_KEYS } from '../config/redis.js';
import { logger } from '../utils/logger.js';

/**
 * Default TTL values in seconds
 */
const DEFAULT_TTL_CONFIG: TTLConfig = {
    base: {
        gameState: 3600,    // 1 hour
        playerSession: 7200, // 2 hours
        gameRoom: 3600,     // 1 hour
        events: 86400       // 24 hours
    },
    active: {
        gameState: 14400,   // 4 hours
        playerSession: 14400,// 4 hours
        gameRoom: 14400     // 4 hours
    },
    finished: {
        gameState: 900,     // 15 minutes
        playerSession: 900,  // 15 minutes
        gameRoom: 900       // 15 minutes
    }
};

export class RedisTTLStrategy implements TTLStrategy {
    private config: TTLConfig;

    constructor(config: Partial<TTLConfig> = {}) {
        this.config = {
            base: { ...DEFAULT_TTL_CONFIG.base, ...config.base },
            active: { ...DEFAULT_TTL_CONFIG.active, ...config.active },
            finished: { ...DEFAULT_TTL_CONFIG.finished, ...config.finished }
        };
    }

    private getConfigForStatus(status: GameStatus): Partial<TTLConfig> {
        switch (status) {
            case 'playing':
                return this.config.active;
            case 'finished':
                return this.config.finished;
            default:
                return this.config.base;
        }
    }

    getTTL(key: keyof TTLConfig['base'], status: GameStatus): number {
        const config = this.getConfigForStatus(status);
        return (config[key] as number) || this.config.base[key];
    }

    async updateGameTTLs(gameId: string, status: GameStatus): Promise<void> {
        const keys = {
            gameState: REDIS_KEYS.GAME_STATE(gameId),
            playerSession: REDIS_KEYS.PLAYER_SESSION(gameId),
            gameRoom: REDIS_KEYS.GAME_ROOM(gameId),
            events: REDIS_KEYS.GAME_EVENTS(gameId)
        };

        try {
            const pipeline = redisClient.multi();

            // Update TTL for all game-related keys
            for (const [key, redisKey] of Object.entries(keys)) {
                const ttl = this.getTTL(key as keyof TTLConfig['base'], status);
                pipeline.expire(redisKey, ttl);
            }

            await pipeline.exec();

            logger.debug('Updated TTLs for game', {
                component: 'TTLStrategy',
                context: { gameId, status }
            });
        } catch (error) {
            logger.error('Failed to update TTLs', {
                component: 'TTLStrategy',
                context: { gameId, status },
                error
            });
            throw error;
        }
    }

    async extendGameTTLs(gameId: string): Promise<void> {
        await this.updateGameTTLs(gameId, 'playing');
        
        logger.debug('Extended TTLs for active game', {
            component: 'TTLStrategy',
            context: { gameId }
        });
    }
}