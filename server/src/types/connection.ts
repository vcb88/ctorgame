export enum WebSocketErrorCode {
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  INVALID_MOVE = 'INVALID_MOVE',
  INVALID_GAME_ID = 'INVALID_GAME_ID',
  INVALID_STATE = 'INVALID_STATE',
  TIMEOUT = 'TIMEOUT',
  GAME_ENDED = 'GAME_ENDED',
  NOT_YOUR_TURN = 'NOT_YOUR_TURN',
  SERVER_ERROR = 'SERVER_ERROR'
}

export interface ErrorResponse {
  code: WebSocketErrorCode;
  message: string;
  details?: unknown;
}

export interface GameEvent {
  eventId: string;
  timestamp: number;
  type: string;
  data?: any;
}