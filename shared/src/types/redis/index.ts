/**
 * Redis types exports
 */

// Core functionality
export * from './enums.js';
export * from './config.js';
export * from './state.js';
export * from './session.js';
export * from './events.js';
export * from './ttl.js';

// Legacy types
import type {
    RedisGameState,
    RedisGameRoom,
    RedisStateBackup,
    RedisMigrationInfo
} from './state.js';
import type {
    RedisPlayerSession,
    RedisSessionMetadata,
    RedisConnectionInfo,
    RedisSessionActivity,
    RedisSessionAnalytics
} from './session.js';
import type {
    RedisGameEvent,
    RedisEventStatus,
    RedisEventBatch,
    RedisEventSubscriber
} from './events.js';
import type {
    RedisConfig,
    RedisCacheConfig,
    RedisPrefixConfig,
    RedisSecurityConfig
} from './config.js';
import type {
    RedisTTLConfig,
    RedisTTLStrategy,
    RedisTTLMetadata
} from './ttl.js';

// Legacy exports
export type {
    RedisGameState as IRedisGameState,
    RedisGameRoom as IRedisGameRoom,
    RedisPlayerSession as IRedisPlayerSession,
    RedisSessionMetadata as IRedisSessionMetadata,
    RedisGameEvent as IRedisGameEvent,
    RedisEventStatus as IRedisEventStatus,
    RedisConfig as IRedisConfig,
    RedisCacheConfig as ICacheConfig,
    RedisTTLConfig as ITTLConfig,
    RedisTTLStrategy as ITTLStrategy
};
