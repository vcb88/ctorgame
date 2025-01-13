// Redis cache configuration
export interface ICacheConfig {
    ttl: {
        gameState: number;
        playerSession: number;
        gameRoom: number;
        events: number;
    };
    prefix?: {
        gameState?: string;
        playerSession?: string;
        gameRoom?: string;
        events?: string;
    };
    options?: {
        maxRetries?: number;
        retryDelay?: number;
        maxItems?: number;
    };
}

// Redis connection configuration
export interface IRedisConfig {
    host: string;
    port: number;
    password?: string;
    db?: number;
    tls?: boolean;
    maxReconnectAttempts?: number;
