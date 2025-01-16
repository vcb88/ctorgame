/**
 * TTL configuration and management types
 */

import { UUID } from '../core/primitives.js';
import { RedisKeyEnum } from './enums.js';
import { RedisTTLStatusEnum } from './enums.js';

/** TTL configuration by key type */
export interface RedisTTLByKey {
    [RedisKeyEnum.GAME_STATE]: number;
    [RedisKeyEnum.PLAYER_SESSION]: number;
    [RedisKeyEnum.GAME_ROOM]: number;
    [RedisKeyEnum.EVENT]: number;
    [RedisKeyEnum.METADATA]: number;
}

/** TTL configuration by game status */
export interface RedisTTLConfig {
    /** Default TTL values in seconds */
    base: RedisTTLByKey;

    /** Extended TTL values for active games */
    active: Partial<RedisTTLByKey>;

    /** Shortened TTL values for finished games */
    finished: Partial<RedisTTLByKey>;

    /** TTL override rules */
    rules?: {
        [key: string]: {
            condition: string;
            ttl: number;
            priority: number;
        };
    };
}

/** TTL strategy options */
export interface RedisTTLStrategyOptions {
    autoExtend?: boolean;
    extendInterval?: number;
    maxExtensions?: number;
    onExpire?: (key: string) => Promise<void>;
}

/** TTL strategy interface */
export interface RedisTTLStrategy {
    /**
     * Get TTL for a specific key based on game status
     * @param key Redis key type
     * @param status Game status
     * @returns TTL in seconds
     */
    getTTL(key: RedisKeyEnum, status: RedisTTLStatusEnum): number;

    /**
     * Update TTLs for all game-related keys
     * @param gameId Game ID
     * @param status Game status
     */
    updateGameTTLs(gameId: UUID, status: RedisTTLStatusEnum): Promise<void>;

    /**
     * Extend TTLs for active game
     * @param gameId Game ID
     * @param options Extension options
     */
    extendGameTTLs(gameId: UUID, options?: {
        keys?: RedisKeyEnum[];
        duration?: number;
        force?: boolean;
    }): Promise<void>;

    /**
     * Reset TTLs to default values
     * @param gameId Game ID
     * @param status New status
     */
    resetGameTTLs(gameId: UUID, status: RedisTTLStatusEnum): Promise<void>;
}

/** TTL tracking metadata */
export interface RedisTTLMetadata {
    key: string;
    baseValue: number;
    currentValue: number;
    expiresAt: number;
    extensions: number;
    lastExtension?: number;
}