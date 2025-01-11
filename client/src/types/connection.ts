export enum ConnectionState {
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  RECONNECTING = 'RECONNECTING',
  ERROR = 'ERROR'
}

export enum GameErrorType {
  CONNECTION = 'CONNECTION',
  VALIDATION = 'VALIDATION',
  TIMEOUT = 'TIMEOUT',
  GAME_STATE = 'GAME_STATE',
  SERVER = 'SERVER'
}

export enum WebSocketErrorCode {
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  INVALID_MOVE = 'INVALID_MOVE',
  INVALID_GAME_ID = 'INVALID_GAME_ID',
  INVALID_STATE = 'INVALID_STATE',
  TIMEOUT = 'TIMEOUT',
  GAME_ENDED = 'GAME_ENDED',
  NOT_YOUR_TURN = 'NOT_YOUR_TURN'
}

export interface GameError {
  type: GameErrorType;
  message: string;
  recoverable?: boolean;
  retryable?: boolean;
  details?: unknown;
}

export interface ErrorResponse {
  code: WebSocketErrorCode;
  message: string;
  details?: unknown;
}

export interface ReconnectionData {
  gameId: string;
  playerNumber: number;
  lastEventId?: string;
  timestamp: number;
}