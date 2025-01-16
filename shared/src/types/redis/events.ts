/**
 * Redis event types
 */

import { UUID, Timestamp } from '../core/primitives.js';
import { RedisEventEnum, RedisEventStatusEnum } from './enums.js';

/** Game events stored in Redis */
export interface RedisGameEvent {
    type: RedisEventEnum;
    gameId: UUID;
    playerId: UUID;
    data: unknown;
    timestamp: Timestamp;
    eventId?: UUID;
    processed?: boolean;
    metadata?: {
        priority?: number;
        retryCount?: number;
        lastRetry?: Timestamp;
    };
}

/** Event processing status */
export interface RedisEventStatus {
    eventId: UUID;
    status: RedisEventStatusEnum;
    error?: string;
    processedAt?: Timestamp;
    attempts?: number;
    processingTime?: number;
}

/** Event batch processing */
export interface RedisEventBatch {
    batchId: UUID;
    events: RedisGameEvent[];
    status: RedisEventStatusEnum;
    processedCount: number;
    failedCount: number;
    createdAt: Timestamp;
    completedAt?: Timestamp;
}

/** Event subscriber options */
export interface RedisEventSubscriber {
    pattern: string;
    callback: (event: RedisGameEvent) => Promise<void>;
    options?: {
        batchSize?: number;
        maxRetries?: number;
        retryDelay?: number;
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