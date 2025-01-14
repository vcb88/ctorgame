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
  PLAYER_DISCONNECT = 'PLAYER_DISCONNECT',
  SERVER = 'SERVER'
}

export enum WebSocketErrorCode {
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  INVALID_MOVE = 'INVALID_MOVE',
  INVALID_GAME_ID = 'INVALID_GAME_ID',
  GAME_NOT_FOUND = 'GAME_NOT_FOUND',
  GAME_FULL = 'GAME_FULL',
  INVALID_STATE = 'INVALID_STATE',
  TIMEOUT = 'TIMEOUT',
  GAME_ENDED = 'GAME_ENDED',
  NOT_YOUR_TURN = 'NOT_YOUR_TURN',
  SERVER_ERROR = 'SERVER_ERROR'
}

export interface GameError {
  type: GameErrorType;
  message: string;
  recoverable: boolean;
  retryable: boolean;
  details?: Record<string, any>;
}

export interface ErrorResponse {
  code: WebSocketErrorCode;
  message: string;
  details?: Record<string, any>;
}

export interface ReconnectionData {
  gameId: string;
  playerNumber: number;
  lastEventId?: string;
  timestamp: number;
}