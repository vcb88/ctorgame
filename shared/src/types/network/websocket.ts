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
    eventId: UUID;
    timestamp: Timestamp;
    type: GameEventType;
};

// Server to client events
export interface ServerToClientEvents {
    'game_created': (event: GameEvent & {
        gameId: UUID;
        code: string;
        status: GameStatus;
    }) => void;

    'game_joined': (event: GameEvent & {
        gameId: UUID;
        status: GameStatus;
    }) => void;

    'game_started': (event: GameEvent & {
        gameId: UUID;
        gameState: GameState;
        currentPlayer: PlayerNumber;
    }) => void;

    'game_state_updated': (event: GameEvent & {
        gameState: GameState;
        currentPlayer: PlayerNumber;
    }) => void;

    'game_over': (event: GameEvent & {
        gameState: GameState;
        winner: PlayerNumber | null;
        finalScores: [number, number];
    }) => void;

    'player_disconnected': (event: GameEvent & {
        playerId: UUID;
        playerNumber: PlayerNumber;
    }) => void;

    'player_reconnected': (event: GameEvent & {
        playerId: UUID;
        playerNumber: PlayerNumber;
        gameState: GameState;
    }) => void;

    'game_expired': (event: GameEvent & {
        gameId: UUID;
        reason?: string;
    }) => void;

    'available_replaces': (event: GameEvent & {
        positions: Position[];
        moves: GameMove[];
    }) => void;

    'error': (event: NetworkError & {
        eventId?: UUID;
    }) => void;
}

// Client to server events
export interface ClientToServerEvents {
    'create_game': (data?: { options?: GameOptions }) => void;

    'join_game': (data: {
        gameId?: UUID;
        code?: string;
    }) => void;

    'make_move': (data: {
        gameId: UUID;
        move: GameMove;
    }) => void;

    'end_turn': (data: {
        gameId: UUID;
    }) => void;

    'disconnect': () => void;

    'reconnect': (data: {
        gameId: UUID;
        sessionId?: UUID;
    }) => void;
}

// Inter-server events (for clustering support)
export interface InterServerEvents {
    'ping': () => void;
}

// Socket data
export type SocketData = {
    socketId: UUID;
    gameId?: UUID;
    playerNumber?: PlayerNumber;
    sessionId?: UUID;
};

// Basic game options
export type GameOptions = {
    boardSize?: number;
    timeLimit?: number;
    privacy?: 'public' | 'private';
};

// Server configuration
export type WebSocketServerConfig = {
    cors: {
        origin: string;
        methods: string[];
    };
    path: string;
    transports: string[];
    pingTimeout: number;
    pingInterval: number;
    maxHttpBufferSize: number;
};

export type WebSocketServerOptions = {
    config?: Partial<WebSocketServerConfig>;
    reconnectTimeout?: number;
    storageService?: any;  // TODO: Replace with proper type
    eventService?: any;     // TODO: Replace with proper type
    redisService?: any;     // TODO: Replace with proper type
};

// Type guards
export const validateEvent = (event: unknown): event is GameEvent => {
    return typeof event === 'object' && event !== null &&
           'eventId' in event &&
           'timestamp' in event &&
           'type' in event;
};