export enum ErrorCode {
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  CONNECTION_TIMEOUT = 'CONNECTION_TIMEOUT',
  CONNECTION_LOST = 'CONNECTION_LOST',
  OPERATION_FAILED = 'OPERATION_FAILED',
  OPERATION_TIMEOUT = 'OPERATION_TIMEOUT',
  OPERATION_CANCELLED = 'OPERATION_CANCELLED',
  INVALID_MOVE = 'INVALID_MOVE',
  INVALID_STATE = 'INVALID_STATE',
  GAME_NOT_FOUND = 'GAME_NOT_FOUND',
  GAME_FULL = 'GAME_FULL',
  STATE_VALIDATION_ERROR = 'STATE_VALIDATION_ERROR',
  STATE_TRANSITION_ERROR = 'STATE_TRANSITION_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum RecoveryStrategy {
  RETRY = 'RETRY',
  RECONNECT = 'RECONNECT',
  RESET = 'RESET',
  USER_ACTION = 'USER_ACTION',
  NOTIFY = 'NOTIFY'
}

export interface GameError {
  code: ErrorCode;
  message: string;
  severity: ErrorSeverity;
  recoverable?: boolean;
  retryCount?: number;
  timestamp?: number;
  details?: Record<string, any>;
  stack?: string;
}

export interface ErrorRecoveryConfig {
  maxRetries?: number;
  retryDelay?: number;
  useBackoff?: boolean;
  recover?: (error: GameError) => Promise<void>;
}

export interface GameActionUnion {
  type: GameActionType;
  gameId?: string;
  move?: any;
  timestamp: number;
}