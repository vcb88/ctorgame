import {
    IPhase,
    IOperationType,
    IErrorCode,
    IMessage,
    IErrorDetails,
    ITimestamp,
    IConnectionStatus,
    IValidationResult
} from './core';

// Game phase interfaces
export interface IGamePhaseBase extends IPhase {}

export enum GamePhase {
    INITIAL = 'INITIAL',
    CONNECTING = 'CONNECTING',
    WAITING = 'WAITING',
    PLAYING = 'PLAYING',
    GAME_OVER = 'GAME_OVER',
    FINISHED = 'FINISHED',
    ERROR = 'ERROR'
}

// Operation type interfaces
export interface IOperationTypeBase extends IOperationType {}

export enum OperationType {
    PLACE = 'place',
    REPLACE = 'replace',
    END_TURN = 'end_turn'
}

// Game constants
export const BOARD_SIZE = 10;
export const MIN_ADJACENT_FOR_REPLACE = 5;
export const MAX_PLACE_OPERATIONS = 2;

// Error interfaces
export interface IErrorBase extends IErrorCode, IMessage {}

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

export interface IGameErrorBase extends IErrorBase {
    readonly severity: ErrorSeverity;
}

export interface GameError extends IGameErrorBase, IErrorDetails, ITimestamp {
    readonly recoverable?: boolean;
    readonly retryCount?: number;
}

// Connection interfaces
export interface IConnectionStateBase extends IConnectionStatus {}

export enum ConnectionState {
    CONNECTING = 'CONNECTING',
    CONNECTED = 'CONNECTED',
    DISCONNECTED = 'DISCONNECTED',
    RECONNECTING = 'RECONNECTING',
    ERROR = 'ERROR'
}

// WebSocket error interfaces
export interface IWebSocketErrorBase extends IErrorCode {}

export enum WebSocketErrorCode {
    INVALID_GAME_ID = 'INVALID_GAME_ID',
    GAME_FULL = 'GAME_FULL',
    GAME_NOT_FOUND = 'GAME_NOT_FOUND',
    GAME_ALREADY_STARTED = 'GAME_ALREADY_STARTED',
    INVALID_MOVE = 'INVALID_MOVE',
    NOT_YOUR_TURN = 'NOT_YOUR_TURN',
    GAME_OVER = 'GAME_OVER',
    GAME_ENDED = 'GAME_ENDED',
    INVALID_STATE = 'INVALID_STATE',
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    SERVER_ERROR = 'SERVER_ERROR',
    CONNECTION_ERROR = 'CONNECTION_ERROR'
}