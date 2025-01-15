/**
 * Game event types and type guards
 */

import type { IGameState, IGameMove, GameStatus, PlayerNumber } from '../game/types.js';
import type { ITimestamped, IIdentifiable } from '../core/primitives.js';
import type { ErrorResponse } from './errors.js';

// Base event interface
export interface IBaseEvent extends ITimestamped, IIdentifiable {
    readonly gameId: string;
    readonly playerId?: string;
}

// Game event types
export interface IGameCreatedEvent extends IBaseEvent {
    readonly type: 'game_created';
    readonly data: {
        readonly gameId: string;
        readonly status: GameStatus;
        readonly createdAt: number;
    };
}

export interface IGameStartedEvent extends IBaseEvent {
    readonly type: 'game_started';
    readonly data: {
        readonly state: IGameState;
        readonly startedAt: number;
    };
}

export interface IGameMoveEvent extends IBaseEvent {
    readonly type: 'game_move';
    readonly data: {
        readonly move: IGameMove;
        readonly state: IGameState;
    };
}

export interface IGameEndedEvent extends IBaseEvent {
    readonly type: 'game_ended';
    readonly data: {
        readonly winner: PlayerNumber | null;
        readonly finalState: IGameState;
        readonly endedAt: number;
    };
}

export interface IGameExpiredEvent extends IBaseEvent {
    readonly type: 'game_expired';
    readonly data: {
        readonly expiredAt: number;
    };
}

export interface IPlayerConnectedEvent extends IBaseEvent {
    readonly type: 'player_connected';
    readonly data: {
        readonly playerId: string;
        readonly playerNumber: PlayerNumber;
        readonly connectedAt: number;
    };
}

export interface IPlayerDisconnectedEvent extends IBaseEvent {
    readonly type: 'player_disconnected';
    readonly data: {
        readonly playerId: string;
        readonly playerNumber: PlayerNumber;
        readonly disconnectedAt: number;
    };
}

export interface IGameErrorEvent extends IBaseEvent {
    readonly type: 'error';
    readonly data: ErrorResponse;
}

// Union type for all game events
export type GameEvent =
    | IGameCreatedEvent
    | IGameStartedEvent
    | IGameMoveEvent 
    | IGameEndedEvent
    | IGameExpiredEvent
    | IPlayerConnectedEvent
    | IPlayerDisconnectedEvent
    | IGameErrorEvent;

// Type guards
export const isGameCreatedEvent = (event: GameEvent): event is IGameCreatedEvent => {
    return event.type === 'game_created';
};

export const isGameStartedEvent = (event: GameEvent): event is IGameStartedEvent => {
    return event.type === 'game_started';
};

export const isGameMoveEvent = (event: GameEvent): event is IGameMoveEvent => {
    return event.type === 'game_move';
};

export const isGameEndedEvent = (event: GameEvent): event is IGameEndedEvent => {
    return event.type === 'game_ended';
};

export const isGameExpiredEvent = (event: GameEvent): event is IGameExpiredEvent => {
    return event.type === 'game_expired';
};

export const isPlayerConnectedEvent = (event: GameEvent): event is IPlayerConnectedEvent => {
    return event.type === 'player_connected';
};

export const isPlayerDisconnectedEvent = (event: GameEvent): event is IPlayerDisconnectedEvent => {
    return event.type === 'player_disconnected';
};

export const isGameErrorEvent = (event: GameEvent): event is IGameErrorEvent => {
    return event.type === 'error';
};

/**
 * Validation helpers
 */

// Event validators
export const validateGameCreatedEvent = (event: IGameCreatedEvent): boolean => {
    return (
        typeof event.gameId === 'string' &&
        typeof event.data.gameId === 'string' &&
        typeof event.data.status === 'string' &&
        typeof event.data.createdAt === 'number' &&
        ['waiting', 'playing', 'finished'].includes(event.data.status)
    );
};

export const validateGameStartedEvent = (event: IGameStartedEvent): boolean => {
    return (
        typeof event.gameId === 'string' &&
        typeof event.data.startedAt === 'number' &&
        event.data.state !== undefined
    );
};

export const validateGameMoveEvent = (event: IGameMoveEvent): boolean => {
    return (
        typeof event.gameId === 'string' &&
        event.data.move !== undefined &&
        event.data.state !== undefined
    );
};

export const validateGameEndedEvent = (event: IGameEndedEvent): boolean => {
    return (
        typeof event.gameId === 'string' &&
        (event.data.winner === null || [1, 2].includes(event.data.winner)) &&
        typeof event.data.endedAt === 'number' &&
        event.data.finalState !== undefined
    );
};

export const validateGameExpiredEvent = (event: IGameExpiredEvent): boolean => {
    return (
        typeof event.gameId === 'string' &&
        typeof event.data.expiredAt === 'number'
    );
};

export const validatePlayerEvent = (
    event: IPlayerConnectedEvent | IPlayerDisconnectedEvent
): boolean => {
    if (event.type === 'player_connected') {
        return (
            typeof event.gameId === 'string' &&
            typeof event.data.playerId === 'string' &&
            [1, 2].includes(event.data.playerNumber) &&
            typeof event.data.connectedAt === 'number'
        );
    } else {
        return (
            typeof event.gameId === 'string' &&
            typeof event.data.playerId === 'string' &&
            [1, 2].includes(event.data.playerNumber) &&
            typeof event.data.disconnectedAt === 'number'
        );
    }
};

export const validateGameErrorEvent = (event: IGameErrorEvent): boolean => {
    return (
        typeof event.gameId === 'string' &&
        typeof event.data.code === 'number' &&
        typeof event.data.message === 'string'
    );
};

// Main validation function
export const validateGameEvent = (event: GameEvent): boolean => {
    switch (event.type) {
        case 'game_created':
            return validateGameCreatedEvent(event);
        case 'game_started':
            return validateGameStartedEvent(event);
        case 'game_move':
            return validateGameMoveEvent(event);
        case 'game_ended':
            return validateGameEndedEvent(event);
        case 'game_expired':
            return validateGameExpiredEvent(event);
        case 'player_connected':
        case 'player_disconnected':
            return validatePlayerEvent(event);
        case 'error':
            return validateGameErrorEvent(event);
        default:
            return false;
    }
};