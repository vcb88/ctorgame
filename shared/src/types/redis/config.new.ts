/**
 * Redis configuration types
 */

/**
 * Redis cache configuration
 */
export interface ICacheConfig {
    readonly ttl: {
        readonly gameState: number;
        readonly playerSession: number;
        readonly gameRoom: number;
        readonly events: number;
    };
    readonly prefix?: {
        readonly gameState?: string;
        readonly playerSession?: string;
        readonly gameRoom?: string;
        readonly events?: string;
    };
    readonly options?: {
        readonly maxRetries?: number;
        readonly retryDelay?: number;
        readonly maxItems?: number;
    };
}

/**
 * Redis connection configuration
 */
export interface IRedisConfig {
    readonly host: string;
    readonly port: number;
    readonly password?: string;
    readonly db?: number;
    readonly tls?: boolean;
    readonly maxReconnectAttempts?: number;
}

/**
 * Type guards
 */
export function isCacheConfig(value: unknown): value is ICacheConfig {
    if (!value || typeof value !== 'object') return false;
    const config = value as ICacheConfig;
    return (
        config.ttl &&
        typeof config.ttl === 'object' &&
        typeof config.ttl.gameState === 'number' &&
        typeof config.ttl.playerSession === 'number' &&
        typeof config.ttl.gameRoom === 'number' &&
        typeof config.ttl.events === 'number'
    );
}

export function isRedisConfig(value: unknown): value is IRedisConfig {
    if (!value || typeof value !== 'object') return false;
    const config = value as IRedisConfig;
    return (
        typeof config.host === 'string' &&
        typeof config.port === 'number'
    );
}