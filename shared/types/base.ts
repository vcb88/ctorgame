// Basic enums and constants
export enum Player {
    None = 0,
    First = 1,
    Second = 2
}

export enum GamePhase {
    INITIAL = 'INITIAL',
    CONNECTING = 'CONNECTING',
    WAITING = 'WAITING',
    PLAYING = 'PLAYING',
    GAME_OVER = 'GAME_OVER',
    ERROR = 'ERROR'
}

export enum GameOutcome {
    Win = 'WIN',
    Loss = 'LOSS',
    Draw = 'DRAW'
}

export enum OperationType {
    PLACE = 'place',
    REPLACE = 'replace',
    END_TURN = 'end_turn'
}

// Game constants
export const BOARD_SIZE = 10;
export const MIN_ADJACENT_FOR_REPLACE = 5;
export const MAX_PLACE_OPERATIONS = 2;

// Basic interfaces
export interface IPosition {
    x: number;
    y: number;
}

export interface IBoardSize {
    width: number;
    height: number;
}

// Basic error types
export enum ErrorCode {
    // Connection errors
    CONNECTION_ERROR = 'CONNECTION_ERROR',
    CONNECTION_TIMEOUT = 'CONNECTION_TIMEOUT',
    CONNECTION_LOST = 'CONNECTION_LOST',
    
    // Operation errors
    OPERATION_FAILED = 'OPERATION_FAILED',
    OPERATION_TIMEOUT = 'OPERATION_TIMEOUT',
    OPERATION_CANCELLED = 'OPERATION_CANCELLED',
    
    // Game errors
    INVALID_MOVE = 'INVALID_MOVE',
    INVALID_STATE = 'INVALID_STATE',
    GAME_NOT_FOUND = 'GAME_NOT_FOUND',
    GAME_FULL = 'GAME_FULL',
    
    // State errors
    STATE_VALIDATION_ERROR = 'STATE_VALIDATION_ERROR',
    STATE_TRANSITION_ERROR = 'STATE_TRANSITION_ERROR',
    
    // Storage errors
    STORAGE_ERROR = 'STORAGE_ERROR',
    
    // Unknown error
    UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export enum ErrorSeverity {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL'
}

export interface GameError {
    code: ErrorCode;
    message: string;
    severity: ErrorSeverity;
    details?: Record<string, unknown>;
    timestamp?: number;
    recoverable?: boolean;
    retryCount?: number;
}

export enum RecoveryStrategy {
    NOTIFY = 'NOTIFY',
    RETRY = 'RETRY',
    RECONNECT = 'RECONNECT',
    RESET = 'RESET',
    USER_ACTION = 'USER_ACTION'
}

export type GameStatus = 'waiting' | 'playing' | 'finished';

export enum ConnectionState {
    CONNECTING = 'CONNECTING',
    CONNECTED = 'CONNECTED',
    DISCONNECTED = 'DISCONNECTED',
    RECONNECTING = 'RECONNECTING',
    ERROR = 'ERROR'
}