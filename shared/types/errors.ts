/**
 * Common error codes across the application
 */
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

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  // Can be ignored
  LOW = 'LOW',
  // Should be reported to user
  MEDIUM = 'MEDIUM',
  // Requires action from user
  HIGH = 'HIGH',
  // Requires system recovery
  CRITICAL = 'CRITICAL'
}

/**
 * Base error structure
 */
export interface GameError {
  code: ErrorCode;
  message: string;
  severity: ErrorSeverity;
  details?: Record<string, unknown>;
  timestamp?: number;
  recoverable?: boolean;
  retryCount?: number;
}

/**
 * Error recovery strategies
 */
export enum RecoveryStrategy {
  // Just notify user
  NOTIFY = 'NOTIFY',
  // Retry operation
  RETRY = 'RETRY',
  // Reconnect to server
  RECONNECT = 'RECONNECT',
  // Reset state
  RESET = 'RESET',
  // Require user action
  USER_ACTION = 'USER_ACTION'
}

/**
 * Recovery configuration for error types
 */
export interface ErrorRecoveryConfig {
  // Maximum retry attempts
  maxRetries?: number;
  // Delay between retries in ms
  retryDelay?: number;
  // Whether to use exponential backoff
  useBackoff?: boolean;
  // Custom recovery function
  recover?: (error: GameError) => Promise<void>;
}