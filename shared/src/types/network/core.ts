/**
 * Network related types using composition
 * Includes WebSocket events and payloads
 */

import type {
    ITimestamped,
    UUID,
    GameStatus
} from '../core/base.js';
import type { IGameState, IGameMove, IPlayer } from '../game/core.js';

// Basic event structure
export interface IGameEvent {
    type: GameEventType;
    gameId: UUID;
    timestamp: Timestamp;
    playerId?: UUID;
}

// Using discriminated union for event types
export type GameEventType =
    | 'game_created'
    | 'game_started'
    | 'game_move'
    | 'game_ended'
    | 'player_connected'
    | 'player_disconnected';

// Event payloads using discriminated unions
export type GameEventPayload =
    | {
        type: 'game_created';
        gameId: UUID;
        player: IPlayer;
      }
    | {
        type: 'game_started';
        gameId: UUID;
        state: IGameState;
        players: IPlayer[];
      }
    | {
        type: 'game_move';
        gameId: UUID;
        move: IGameMove;
        state: IGameState;
      }
    | {
        type: 'game_ended';
        gameId: UUID;
        state: IGameState;
        winner: PlayerNumber;
      }
    | {
        type: 'player_connected' | 'player_disconnected';
        gameId: UUID;
        player: IPlayer;
      };

// WebSocket message structure
export interface IWSMessage<T extends GameEventPayload> {
    event: T['type'];
    data: T;
    timestamp: Timestamp;
}