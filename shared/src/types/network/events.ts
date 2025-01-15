/**
 * Simplified game event types
 */

import type { GameState, GameMove, PlayerNumber } from '../primitives.js';
import type { GameError } from '../core.js';

/** Basic event metadata */
type EventMeta = {
    id: string;
    gameId: string;
    timestamp: number;
    playerId?: string;
};

/** Event types */
export type EventType = 
    | 'game_created' 
    | 'game_started' 
    | 'game_move'
    | 'game_ended'
    | 'game_expired'
    | 'player_connected'
    | 'player_disconnected'
    | 'error';

/** Event payloads */
type GameCreatedPayload = {
    status: 'waiting';
};

type GameStartedPayload = {
    state: GameState;
};

type GameMovePayload = {
    move: GameMove;
    state: GameState;
};

type GameEndedPayload = {
    winner: PlayerNumber | null;
    finalState: GameState;
};

type GameExpiredPayload = {
    reason?: string;
};

type PlayerEventPayload = {
    playerId: string;
    playerNum: PlayerNumber;
};

/** Combined game event type */
export type GameEvent = EventMeta & (
    | { type: 'game_created'; data: GameCreatedPayload }
    | { type: 'game_started'; data: GameStartedPayload }
    | { type: 'game_move'; data: GameMovePayload }
    | { type: 'game_ended'; data: GameEndedPayload }
    | { type: 'game_expired'; data: GameExpiredPayload }
    | { type: 'player_connected'; data: PlayerEventPayload }
    | { type: 'player_disconnected'; data: PlayerEventPayload }
    | { type: 'error'; data: GameError }
);

/** Type guards */
const isEventType = (type: string): type is EventType => {
    return [
        'game_created',
        'game_started',
        'game_move',
        'game_ended',
        'game_expired',
        'player_connected',
        'player_disconnected',
        'error'
    ].includes(type);
};

/** Basic event validation */
export const validateEvent = (event: unknown): event is GameEvent => {
    // Basic structure check
    if (!event || typeof event !== 'object') return false;
    const e = event as any;

    // Validate metadata
    if (
        typeof e.id !== 'string' ||
        typeof e.gameId !== 'string' ||
        typeof e.timestamp !== 'number' ||
        !isEventType(e.type) ||
        typeof e.data !== 'object'
    ) return false;

    // Optional playerId
    if (e.playerId !== undefined && typeof e.playerId !== 'string') return false;

    // Validate specific event types
    switch (e.type) {
        case 'game_created':
            return e.data.status === 'waiting';

        case 'game_started':
            return e.data.state !== undefined;

        case 'game_move':
            return (
                e.data.move !== undefined && 
                e.data.state !== undefined
            );

        case 'game_ended':
            return (
                e.data.finalState !== undefined &&
                (e.data.winner === null || [1, 2].includes(e.data.winner))
            );

        case 'game_expired':
            return e.data !== undefined;

        case 'player_connected':
        case 'player_disconnected':
            return (
                typeof e.data.playerId === 'string' &&
                [1, 2].includes(e.data.playerNum)
            );

        case 'error':
            return (
                typeof e.data.code === 'string' &&
                typeof e.data.message === 'string'
            );
    }

    return false;
};