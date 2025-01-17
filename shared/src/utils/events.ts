import type { GameEvent, WebSocketEvent } from '../types/base/types.js';

/**
 * Create a game event
 * @param type Type of the event
 * @param gameId ID of the game this event belongs to
 * @param data Optional event data
 */
export const createGameEvent = <T>(type: WebSocketEvent, gameId: string, data?: T): GameEvent => ({
    type,
    id: crypto.randomUUID(),
    gameId,
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
        typeof e.gameId === 'string' &&
        (e.playerNumber === undefined || typeof e.playerNumber === 'number')
    );
};