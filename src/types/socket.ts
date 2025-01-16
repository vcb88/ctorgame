import type { Position } from './index.js';
import type {
    GameEvent,
    IGameCreatedEvent,
    IGameStartedEvent,
    IGameMoveEvent,
    IGameEndedEvent,
    IGameExpiredEvent,
    IPlayerConnectedEvent,
    IPlayerDisconnectedEvent,
    IGameErrorEvent
} from '@ctor-game/shared/src/types/network/events.new.js';

import type { IGameState, PlayerNumber } from '@ctor-game/shared/src/types/game/types.js';
import type { WebSocketErrorCode } from '@ctor-game/shared/src/types/network/events.js';

// Base event interface for all socket responses
export type SocketEvent = {
    eventId: string;
    timestamp: number;
};

// Event responses
export type GameCreatedResponse = SocketEvent & {
    gameId: string;
    status: 'waiting';
};

export type GameJoinedResponse = SocketEvent & {
    gameId: string;
    status: string;
};

export type GameStartedResponse = SocketEvent & {
    gameId: string;
    gameState: IGameState;
    currentPlayer: PlayerNumber;
};

export type GameStateUpdatedResponse = SocketEvent & {
    gameState: IGameState;
    currentPlayer: PlayerNumber;
};

export type GameOverResponse = SocketEvent & {
    gameState: IGameState;
    winner: PlayerNumber | null;
};

export type PlayerDisconnectedResponse = SocketEvent & {
    playerId: string;
    playerNumber: PlayerNumber;
};

export type PlayerReconnectedResponse = SocketEvent & {
    playerId: string;
    playerNumber: PlayerNumber;
};

export type GameExpiredResponse = SocketEvent & {
    gameId: string;
};

export type ErrorResponse = SocketEvent & {
    code: WebSocketErrorCode;
    message: string;
    details?: unknown;
};

// Socket event map
export interface ServerToClientEvents {
    'game_created': (response: GameCreatedResponse) => void;
    'game_joined': (response: GameJoinedResponse) => void;
    'game_started': (response: GameStartedResponse) => void;
    'game_state_updated': (response: GameStateUpdatedResponse) => void;
    'game_over': (response: GameOverResponse) => void;
    'player_disconnected': (response: PlayerDisconnectedResponse) => void;
    'player_reconnected': (response: PlayerReconnectedResponse) => void;
    'game_expired': (response: GameExpiredResponse) => void;
    'error': (response: ErrorResponse) => void;
}

// Client event map
export interface ClientToServerEvents {
    'create_game': () => void;
    'join_game': (data: { gameId: string }) => void;
    'make_move': (data: { gameId: string; move: { type: 'place' | 'replace'; position: Position } }) => void;
    'end_turn': (data: { gameId: string }) => void;
    'reconnect': (data: { gameId: string }) => void;
    'disconnect': () => void;
}