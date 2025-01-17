import type { GameEvent, WebSocketEvent } from '../types/base/types';

/**
 * Create a game event
 */
export const createGameEvent = <T>(type: WebSocketEvent, data?: T): GameEvent => ({
    type,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    data: data || undefined
});

/**
 * Check if the event is of a specific type
 */
export const isEventType = <T extends WebSocketEvent>(event: GameEvent, type: T): event is GameEvent & { type: T } => {
    return event.type === type;
};

/**
 * Validate event structure
 */
export const validateEvent = (event: unknown): event is GameEvent => {
    if (!event || typeof event !== 'object') {
        return false;
    }
    const e = event as GameEvent;
    return (
        typeof e.type === 'string' &&
        typeof e.id === 'string' &&
        typeof e.timestamp === 'number' &&
        (e.gameId === undefined || typeof e.gameId === 'string') &&
        (e.player === undefined || typeof e.player === 'number')
    );
};