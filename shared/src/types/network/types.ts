/**
 * Network communication types
 */

import type { IGameState, IGameMove, GameStatus } from '../game/types.js';
import type { ITimestamped, IIdentifiable } from '../core/primitives.js';

// WebSocket event types
export type GameEventType =
    | 'game_created'
    | 'game_started'
    | 'game_move'
    | 'game_ended'
    | 'player_connected'
    | 'player_disconnected';

// Event payloads using composition
export interface IGameEvent extends ITimestamped, IIdentifiable {
    readonly type: GameEventType;
    readonly gameId: string;
    readonly playerId?: string;
    readonly data: unknown;
}

// Specific event interfaces using type discrimination
export interface IGameCreatedEvent extends IGameEvent {
    readonly type: 'game_created';
    readonly data: {
        readonly gameId: string;
        readonly status: GameStatus;
    };
}

export interface IGameMoveEvent extends IGameEvent {
    readonly type: 'game_move';
    readonly data: {
        readonly move: IGameMove;
        readonly state: IGameState;
    };
}

// Type guard to check specific event types
export const isGameMoveEvent = (event: IGameEvent): event is IGameMoveEvent => {
    return event.type === 'game_move';
};