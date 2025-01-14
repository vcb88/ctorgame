import type { IGameState, IGameMove, PlayerNumber, GameStatus } from '../game/types.js';
type UUID = string;

// WebSocket event types
export type WebSocketEventType =
    | 'create_game'
    | 'game_created'
    | 'join_game'
    | 'game_joined'
    | 'game_started'
    | 'make_move'
    | 'game_state_updated'
    | 'end_turn'
    | 'turn_ended'
    | 'game_over'
    | 'error';

// Error codes
export type WebSocketErrorCode =
    | 'invalid_game_id'
    | 'invalid_move'
    | 'invalid_state'
    | 'not_your_turn'
    | 'game_ended'
    | 'server_error';

// Base event interface
export interface WebSocketEvent {
    readonly eventId: UUID;
    readonly timestamp: number;
}

// Server to client events
export interface ServerToClientEvents {
    'game_created': (event: WebSocketEvent & {
        readonly gameId: UUID;
    }) => void;

    'game_joined': (event: WebSocketEvent & {
        readonly gameId: UUID;
        readonly status: GameStatus;
    }) => void;

    'game_started': (event: WebSocketEvent & {
        readonly gameId: UUID;
        readonly gameState: IGameState;
        readonly currentPlayer: PlayerNumber;
    }) => void;

    'game_state_updated': (event: WebSocketEvent & {
        readonly gameState: IGameState;
        readonly currentPlayer: PlayerNumber;
    }) => void;

    'turn_ended': (event: WebSocketEvent & {
        readonly gameState: IGameState;
        readonly nextPlayer: PlayerNumber;
    }) => void;

    'game_over': (event: WebSocketEvent & {
        readonly gameState: IGameState;
        readonly winner: PlayerNumber | null;
    }) => void;

    'error': (event: {
        readonly code: WebSocketErrorCode;
        readonly message: string;
        readonly details?: unknown;
    }) => void;
}

// Client to server events
export interface ClientToServerEvents {
    'create_game': () => void;

    'join_game': (data: {
        readonly gameId: UUID;
    }) => void;

    'make_move': (data: {
        readonly gameId: UUID;
        readonly move: IGameMove;
    }) => void;

    'end_turn': (data: {
        readonly gameId: UUID;
    }) => void;
}

// Inter-server events
export interface InterServerEvents {
    'ping': () => void;
}

// Socket data
export interface SocketData {
    readonly userId: UUID;
    readonly gameId?: UUID;
    readonly playerNumber?: PlayerNumber;
}