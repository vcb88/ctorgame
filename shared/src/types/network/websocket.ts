/**
 * WebSocket types and interfaces for game communication
 */

import type { IGameState, IGameMove, PlayerNumber, GameStatus } from '../game/types.js';
import type { ErrorCode, ErrorSeverity, INetworkError } from './errors.js';
type UUID = string;

export type WebSocketEvent = 'connect' | 'disconnect' | 'error' | 'message' | 'close';

export interface IWebSocketErrorCode {
    code: number;
    description: string;
}

// WebSocket event types
export type WebSocketEventType =
    // Client -> Server events
    | 'create_game'
    | 'join_game'
    | 'make_move'
    | 'end_turn'
    | 'disconnect'
    | 'reconnect'
    // Server -> Client events
    | 'game_created'
    | 'game_joined'
    | 'game_started'
    | 'game_state_updated'
    | 'game_over'
    | 'player_disconnected'
    | 'player_reconnected'
    | 'game_expired'
    | 'available_replaces'
    | 'error';

// Base event interface
export interface IWebSocketEvent {
    readonly eventId: UUID;
    readonly timestamp: number;
}

// Server to client events
export interface ServerToClientEvents {
    'game_created': (event: IWebSocketEvent & {
        readonly gameId: UUID;
    }) => void;

    'game_joined': (event: IWebSocketEvent & {
        readonly gameId: UUID;
        readonly status: GameStatus;
    }) => void;

    'game_started': (event: IWebSocketEvent & {
        readonly gameId: UUID;
        readonly gameState: IGameState;
        readonly currentPlayer: PlayerNumber;
    }) => void;

    'game_state_updated': (event: IWebSocketEvent & {
        readonly gameState: IGameState;
        readonly currentPlayer: PlayerNumber;
        readonly status: GameStatus;
    }) => void;

    'game_over': (event: IWebSocketEvent & {
        readonly gameState: IGameState;
        readonly winner: PlayerNumber | null;
    }) => void;

    'player_disconnected': (event: IWebSocketEvent & {
        readonly playerNumber: PlayerNumber;
    }) => void;

    'player_reconnected': (event: IWebSocketEvent & {
        readonly playerNumber: PlayerNumber;
        readonly gameState: IGameState;
        readonly currentPlayer: PlayerNumber;
    }) => void;

    'game_expired': (event: IWebSocketEvent & {
        readonly gameId: UUID;
        readonly reason?: string;
    }) => void;

    'available_replaces': (event: IWebSocketEvent & {
        readonly replacements: Array<[number, number]>;
        readonly moves: IGameMove[];
    }) => void;

    'error': (event: INetworkError) => void;
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

    'disconnect': () => void;

    'reconnect': (data: {
        readonly gameId: UUID;
    }) => void;
}

// Inter-server events (for clustering support)
export interface InterServerEvents {
    'ping': () => void;
}

// Socket data
export interface ISocketData {
    readonly userId: UUID;
    readonly gameId?: UUID;
    readonly playerNumber?: PlayerNumber;
}

// Server configuration
export interface IWebSocketServerConfig {
    readonly cors: {
        readonly origin: string;
        readonly methods: string[];
    };
    readonly path: string;
    readonly transports: string[];
    readonly pingTimeout: number;
    readonly pingInterval: number;
    readonly maxHttpBufferSize: number;
}

export interface IWebSocketServerOptions {
    readonly config?: Partial<IWebSocketServerConfig>;
    readonly reconnectTimeout?: number;
}

// Type guards
export const isGameEvent = (event: unknown): event is IWebSocketEvent => {
    return typeof event === 'object' && event !== null &&
           'eventId' in event && 'timestamp' in event;
};