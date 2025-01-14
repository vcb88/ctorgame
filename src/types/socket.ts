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
export interface SocketEvent {
    eventId: string;
    timestamp: number;
}

// Event responses
export interface GameCreatedResponse extends SocketEvent {
    gameId: string;
    status: 'waiting';
}

export interface GameJoinedResponse extends SocketEvent {
    gameId: string;
    status: string;
}

export interface GameStartedResponse extends SocketEvent {
    gameId: string;
    gameState: IGameState;
    currentPlayer: PlayerNumber;
}

export interface GameStateUpdatedResponse extends SocketEvent {
    gameState: IGameState;
    currentPlayer: PlayerNumber;
}

export interface GameOverResponse extends SocketEvent {
    gameState: IGameState;
    winner: PlayerNumber | null;
}

export interface PlayerDisconnectedResponse extends SocketEvent {
    playerId: string;
    playerNumber: PlayerNumber;
}

export interface PlayerReconnectedResponse extends SocketEvent {
    playerId: string;
    playerNumber: PlayerNumber;
}

export interface GameExpiredResponse extends SocketEvent {
    gameId: string;
}

export interface ErrorResponse extends SocketEvent {
    code: WebSocketErrorCode;
    message: string;
    details?: unknown;
}

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
    'make_move': (data: { gameId: string; move: { type: 'place' | 'replace'; position: { x: number; y: number } } }) => void;
    'end_turn': (data: { gameId: string }) => void;
    'reconnect': (data: { gameId: string }) => void;
    'disconnect': () => void;
}