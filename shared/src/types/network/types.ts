/**
 * Network communication types
 */

import type { UUID, Timestamp, GameStatus } from '../base/primitives.js';
import type { GameState } from '../game/types.js';
import type { GameMove } from '../state/moves.js';

// WebSocket event types
export type GameEventType =
    | 'game_created'
    | 'game_started'
    | 'game_move'
    | 'game_ended'
    | 'player_connected'
    | 'player_disconnected';

// Base event type
export type GameEvent = {
    id: UUID;
    type: GameEventType;
    gameId: UUID;
    playerId?: UUID;
    timestamp: Timestamp;
    data: unknown;
};

// Specific event types using type discrimination
export type GameCreatedEvent = GameEvent & {
    type: 'game_created';
    data: {
        gameId: UUID;
        status: GameStatus;
    };
};

export type GameMoveEvent = GameEvent & {
    type: 'game_move';
    data: {
        move: GameMove;
        state: GameState;
    };
};

// Type guard to check specific event types
export const isGameMoveEvent = (event: GameEvent): event is GameMoveEvent => {
    return event.type === 'game_move';
};