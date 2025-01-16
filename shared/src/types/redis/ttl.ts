/**
 * TTL configuration and management types
 */

import { UUID } from '../core/primitives.js';
import { RedisKeyEnum } from './enums.js';
import { RedisTTLStatusEnum } from './enums.js';

/** TTL configuration by key type */
export interface RedisTTLByKey {
    readonly [RedisKeyEnum.GAME_STATE]: number;
    readonly [RedisKeyEnum.PLAYER_SESSION]: number;
    readonly [RedisKeyEnum.GAME_ROOM]: number;
    readonly [RedisKeyEnum.EVENT]: number;
    readonly [RedisKeyEnum.METADATA]: number;
}

/** TTL configuration by game status */
export interface RedisTTLConfig {
    /** Default TTL values in seconds */
    readonly base: RedisTTLByKey;

    /** Extended TTL values for active games */
    readonly active: Partial<RedisTTLByKey>;

    /** Shortened TTL values for finished games */
    readonly finished: Partial<RedisTTLByKey>;

    /** TTL override rules */
    readonly rules?: {
        readonly [key: string]: {
            readonly condition: string;
            readonly ttl: number;
            readonly priority: number;
        };
    };
}

/** TTL strategy options */
export interface RedisTTLStrategyOptions {
    readonly autoExtend?: boolean;
    readonly extendInterval?: number;
    readonly maxExtensions?: number;
    readonly onExpire?: (key: string) => Promise<void>;
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
    readonly key: string;
    readonly baseValue: number;
    readonly currentValue: number;
    readonly expiresAt: number;
    readonly extensions: number;
    readonly lastExtension?: number;
}