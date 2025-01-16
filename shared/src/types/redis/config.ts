/**
 * Redis configuration types
 */

import { RedisKeyEnum } from './enums.js';

/** Redis cache TTL configuration */
export interface RedisTTLConfig {
    readonly gameState: number;
    readonly playerSession: number;
    readonly gameRoom: number;
    readonly events: number;
}

/** Redis key prefix configuration */
export interface RedisPrefixConfig {
    readonly [RedisKeyEnum.GAME_STATE]?: string;
    readonly [RedisKeyEnum.GAME_ROOM]?: string;
    readonly [RedisKeyEnum.PLAYER_SESSION]?: string;
    readonly [RedisKeyEnum.EVENT]?: string;
    readonly [RedisKeyEnum.METADATA]?: string;
}

/** Redis cache options */
export interface RedisCacheOptions {
    readonly maxRetries?: number;
    readonly retryDelay?: number;
    readonly maxItems?: number;
    readonly evictionPolicy?: 'lru' | 'lfu' | 'random';
    readonly compression?: boolean;
}

/** Redis cache configuration */
export interface RedisCacheConfig {
    readonly ttl: RedisTTLConfig;
    readonly prefix?: RedisPrefixConfig;
    readonly options?: RedisCacheOptions;
}

/** Redis connection security */
export interface RedisSecurityConfig {
    readonly tls?: boolean;
    readonly cert?: string;
    readonly key?: string;
    readonly ca?: string;
    readonly password?: string;
}

/** Redis connection retry policy */
export interface RedisRetryConfig {
    readonly maxAttempts?: number;
    readonly delay?: number;
    readonly maxDelay?: number;
    readonly useExponential?: boolean;
}

/** Redis cluster configuration */
export interface RedisClusterConfig {
    readonly enabled: boolean;
    readonly nodes?: { host: string; port: number; }[];
    readonly options?: {
        readonly maxRedirections?: number;
        readonly retryDelayOnFailover?: number;
        readonly retryDelayOnClusterDown?: number;
    };
}

/** Redis connection configuration */
export interface RedisConfig {
    readonly host: string;
    readonly port: number;
    readonly db?: number;
    readonly security?: RedisSecurityConfig;
    readonly retry?: RedisRetryConfig;
    readonly cluster?: RedisClusterConfig;
    readonly monitoring?: {
        readonly enabled?: boolean;
        readonly interval?: number;
        readonly slowLogThreshold?: number;
    };
}

/** Type guards */
export function isRedisCacheConfig(value: unknown): value is RedisCacheConfig {
    if (!value || typeof value !== 'object') return false;
    const config = value as RedisCacheConfig;
    return (
        config.ttl &&
        typeof config.ttl === 'object' &&
        typeof config.ttl.gameState === 'number' &&
        typeof config.ttl.playerSession === 'number' &&
        typeof config.ttl.gameRoom === 'number' &&
        typeof config.ttl.events === 'number'
    );
}

export function isRedisConfig(value: unknown): value is RedisConfig {
    if (!value || typeof value !== 'object') return false;
    const config = value as RedisConfig;
    return (
        typeof config.host === 'string' &&
        typeof config.port === 'number'
    );
}