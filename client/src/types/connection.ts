import type {
    ConnectionStatus,
    WebSocketErrorCode
} from '@ctor-game/shared/types/core.js';

// Define local types for missing exports
export interface ErrorResponse {
    code: WebSocketErrorCode;
    message: string;
}

export interface ReconnectionData {
    gameId: string;
    playerToken: string;
}

export type ConnectionState = ConnectionStatus;

export type {
    WebSocketErrorCode
};