/**
 * Redis configuration types
 */

import { RedisKeyEnum } from './enums.js';

/** Redis cache TTL configuration */
export interface RedisTTLConfig {
    gameState: number;
    playerSession: number;
    gameRoom: number;
    events: number;
}

/** Redis key prefix configuration */
export interface RedisPrefixConfig {
    [RedisKeyEnum.GAME_STATE]?: string;
    [RedisKeyEnum.GAME_ROOM]?: string;
    [RedisKeyEnum.PLAYER_SESSION]?: string;
    [RedisKeyEnum.EVENT]?: string;
    [RedisKeyEnum.METADATA]?: string;
}

/** Redis cache options */
export interface RedisCacheOptions {
    maxRetries?: number;
    retryDelay?: number;
    maxItems?: number;
    evictionPolicy?: 'lru' | 'lfu' | 'random';
    compression?: boolean;
}

/** Redis cache configuration */
export interface RedisCacheConfig {
    ttl: RedisTTLConfig;
    prefix?: RedisPrefixConfig;
    options?: RedisCacheOptions;
}

/** Redis connection security */
export interface RedisSecurityConfig {
    tls?: boolean;
    cert?: string;
    key?: string;
    ca?: string;
    password?: string;
}

/** Redis connection retry policy */
export interface RedisRetryConfig {
    maxAttempts?: number;
    delay?: number;
    maxDelay?: number;
    useExponential?: boolean;
}

/** Redis cluster configuration */
export interface RedisClusterConfig {
    enabled: boolean;
    nodes?: { host: string; port: number; }[];
    options?: {
        maxRedirections?: number;
        retryDelayOnFailover?: number;
        retryDelayOnClusterDown?: number;
    };
}

/** Redis connection configuration */
export interface RedisConfig {
    host: string;
    port: number;
    db?: number;
    security?: RedisSecurityConfig;
    retry?: RedisRetryConfig;
    cluster?: RedisClusterConfig;
    monitoring?: {
        enabled?: boolean;
        interval?: number;
        slowLogThreshold?: number;
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