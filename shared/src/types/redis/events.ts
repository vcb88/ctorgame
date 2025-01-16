/**
 * Redis event types
 */

import { UUID, Timestamp } from '../core/primitives.js';
import { RedisEventEnum, RedisEventStatusEnum } from './enums.js';

/** Game events stored in Redis */
export interface RedisGameEvent {
    readonly type: RedisEventEnum;
    readonly gameId: UUID;
    readonly playerId: UUID;
    readonly data: unknown;
    readonly timestamp: Timestamp;
    readonly eventId?: UUID;
    readonly processed?: boolean;
    readonly metadata?: {
        readonly priority?: number;
        readonly retryCount?: number;
        readonly lastRetry?: Timestamp;
    };
}

/** Event processing status */
export interface RedisEventStatus {
    readonly eventId: UUID;
    readonly status: RedisEventStatusEnum;
    readonly error?: string;
    readonly processedAt?: Timestamp;
    readonly attempts?: number;
    readonly processingTime?: number;
}

/** Event batch processing */
export interface RedisEventBatch {
    readonly batchId: UUID;
    readonly events: RedisGameEvent[];
    readonly status: RedisEventStatusEnum;
    readonly processedCount: number;
    readonly failedCount: number;
    readonly createdAt: Timestamp;
    readonly completedAt?: Timestamp;
}

/** Event subscriber options */
export interface RedisEventSubscriber {
    readonly pattern: string;
    readonly callback: (event: RedisGameEvent) => Promise<void>;
    readonly options?: {
        readonly batchSize?: number;
        readonly maxRetries?: number;
        readonly retryDelay?: number;
    };
}

/** Type guards */
export function isRedisGameEvent(value: unknown): value is RedisGameEvent {
    if (!value || typeof value !== 'object') return false;
    const event = value as RedisGameEvent;
    return (
        typeof event.type === 'string' &&
        Object.values(RedisEventEnum).includes(event.type as RedisEventEnum) &&
        typeof event.gameId === 'string' &&
        typeof event.playerId === 'string' &&
        typeof event.timestamp === 'number'
    );
}

export function isRedisEventStatus(value: unknown): value is RedisEventStatus {
    if (!value || typeof value !== 'object') return false;
    const status = value as RedisEventStatus;
    return (
        typeof status.eventId === 'string' &&
        typeof status.status === 'string' &&
        Object.values(RedisEventStatusEnum).includes(status.status as RedisEventStatusEnum)
    );
}