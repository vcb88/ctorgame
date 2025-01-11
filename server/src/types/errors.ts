// This is a copy of shared WebSocket error types
// Must be kept in sync with shared/types/events.ts

export enum WebSocketErrorCode {
    INVALID_GAME_ID = 'INVALID_GAME_ID',
    GAME_NOT_FOUND = 'GAME_NOT_FOUND',
    GAME_FULL = 'GAME_FULL',
    INVALID_MOVE = 'INVALID_MOVE',
    NOT_YOUR_TURN = 'NOT_YOUR_TURN',
    GAME_ENDED = 'GAME_ENDED',
    INVALID_STATE = 'INVALID_STATE',
    CONNECTION_ERROR = 'CONNECTION_ERROR',
    SERVER_ERROR = 'SERVER_ERROR',
    TIMEOUT = 'TIMEOUT'
}

export interface ErrorResponse {
    code: WebSocketErrorCode;
    message: string;
    details?: Record<string, any>;
}