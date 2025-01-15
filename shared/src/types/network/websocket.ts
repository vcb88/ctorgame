/**
 * WebSocket types and interfaces for game communication
 */

import type {
    GameState,
    GameMove,
    PlayerNumber,
    GameStatus,
    Position,
    Timestamp,
    UUID
} from '../primitives.js';
import type { NetworkError } from './errors.js';

// Basic WebSocket events
export type WebSocketEvent = 'connect' | 'disconnect' | 'error' | 'message' | 'close';

// Custom application events
export type ClientToServerEventType = 
    | 'create_game'
    | 'join_game'
    | 'make_move'
    | 'end_turn'
    | 'disconnect'
    | 'reconnect';

export type ServerToClientEventType =
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

export type GameEventType = ClientToServerEventType | ServerToClientEventType;

// Error codes
export enum WebSocketErrorCode {
    InvalidInput = 'invalid_input',
    GameNotFound = 'game_not_found',
    GameFull = 'game_full',
    NotYourTurn = 'not_your_turn',
    GameEnded = 'game_ended',
    InternalError = 'internal_error'
}

// Base event interface
export type GameEvent = {
    readonly eventId: UUID;
    readonly timestamp: Timestamp;
    readonly type: GameEventType;
};

// Server to client events
export interface ServerToClientEvents {
    'game_created': (event: GameEvent & {
        readonly gameId: UUID;
        readonly code: string;
        readonly status: GameStatus;
    }) => void;

    'game_joined': (event: GameEvent & {
        readonly gameId: UUID;
        readonly status: GameStatus;
    }) => void;

    'game_started': (event: GameEvent & {
        readonly gameId: UUID;
        readonly gameState: GameState;
        readonly currentPlayer: PlayerNumber;
    }) => void;

    'game_state_updated': (event: GameEvent & {
        readonly gameState: GameState;
        readonly currentPlayer: PlayerNumber;
    }) => void;

    'game_over': (event: GameEvent & {
        readonly gameState: GameState;
        readonly winner: PlayerNumber | null;
        readonly finalScores: [number, number];
    }) => void;

    'player_disconnected': (event: GameEvent & {
        readonly playerId: UUID;
        readonly playerNumber: PlayerNumber;
    }) => void;

    'player_reconnected': (event: GameEvent & {
        readonly playerId: UUID;
        readonly playerNumber: PlayerNumber;
        readonly gameState: GameState;
    }) => void;

    'game_expired': (event: GameEvent & {
        readonly gameId: UUID;
        readonly reason?: string;
    }) => void;

    'available_replaces': (event: GameEvent & {
        readonly positions: Position[];
        readonly moves: GameMove[];
    }) => void;

    'error': (event: NetworkError & {
        readonly eventId?: UUID;
    }) => void;
}

// Client to server events
export interface ClientToServerEvents {
    'create_game': (data?: { options?: GameOptions }) => void;

    'join_game': (data: {
        readonly gameId?: UUID;
        readonly code?: string;
    }) => void;

    'make_move': (data: {
        readonly gameId: UUID;
        readonly move: GameMove;
    }) => void;

    'end_turn': (data: {
        readonly gameId: UUID;
    }) => void;

    'disconnect': () => void;

    'reconnect': (data: {
        readonly gameId: UUID;
        readonly sessionId?: UUID;
    }) => void;
}

// Inter-server events (for clustering support)
export interface InterServerEvents {
    'ping': () => void;
}

// Socket data
export type SocketData = {
    readonly socketId: UUID;
    readonly gameId?: UUID;
    readonly playerNumber?: PlayerNumber;
    readonly sessionId?: UUID;
};

// Basic game options
export type GameOptions = {
    readonly boardSize?: number;
    readonly timeLimit?: number;
    readonly privacy?: 'public' | 'private';
};

// Server configuration
export type WebSocketServerConfig = {
    readonly cors: {
        readonly origin: string;
        readonly methods: string[];
    };
    readonly path: string;
    readonly transports: string[];
    readonly pingTimeout: number;
    readonly pingInterval: number;
    readonly maxHttpBufferSize: number;
};

export type WebSocketServerOptions = {
    readonly config?: Partial<WebSocketServerConfig>;
    readonly reconnectTimeout?: number;
    readonly storageService?: any;  // TODO: Replace with proper type
    readonly eventService?: any;     // TODO: Replace with proper type
    readonly redisService?: any;     // TODO: Replace with proper type
};

// Type guards
export const validateEvent = (event: unknown): event is GameEvent => {
    return typeof event === 'object' && event !== null &&
           'eventId' in event &&
           'timestamp' in event &&
           'type' in event;
};