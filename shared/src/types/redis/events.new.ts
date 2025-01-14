/**
 * Redis event types
 */

type EventType = 'move' | 'disconnect' | 'reconnect' | 'end_turn';
type EventStatus = 'pending' | 'processing' | 'completed' | 'failed';

/**
 * Game events stored in Redis
 */
export interface IRedisGameEvent {
    readonly type: EventType;
    readonly gameId: string;
    readonly playerId: string;
    readonly data: unknown;
    readonly timestamp: number;
    readonly eventId?: string;
    readonly processed?: boolean;
}

/**
 * Event processing status
 */
export interface IRedisEventStatus {
    readonly eventId: string;
    readonly status: EventStatus;
    readonly error?: string;
    readonly processedAt?: number;
}

/**
 * Type guards
 */
export function isRedisGameEvent(value: unknown): value is IRedisGameEvent {
    if (!value || typeof value !== 'object') return false;
    const event = value as IRedisGameEvent;
    return (
        typeof event.type === 'string' &&
        ['move', 'disconnect', 'reconnect', 'end_turn'].includes(event.type) &&
        typeof event.gameId === 'string' &&
        typeof event.playerId === 'string' &&
        typeof event.timestamp === 'number'
    );
}

export function isRedisEventStatus(value: unknown): value is IRedisEventStatus {
    if (!value || typeof value !== 'object') return false;
    const status = value as IRedisEventStatus;
    return (
        typeof status.eventId === 'string' &&
        typeof status.status === 'string' &&
        ['pending', 'processing', 'completed', 'failed'].includes(status.status)
    );
}