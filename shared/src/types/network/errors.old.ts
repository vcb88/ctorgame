/**
 * Network error types and interfaces
 */

/** Error severity levels */
export type ErrorSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

/** Error recovery strategies */
export type RecoveryStrategy = 'RETRY' | 'RECONNECT' | 'RESET' | 'USER_ACTION' | 'NOTIFY';

/** Error codes */
export type ErrorCode = 
    // Connection errors
    | 'CONNECTION_ERROR'
    | 'CONNECTION_TIMEOUT'
    | 'CONNECTION_LOST'
    // Operation errors
    | 'OPERATION_FAILED'
    | 'OPERATION_TIMEOUT'
    | 'OPERATION_CANCELLED'
    // Validation errors
    | 'INVALID_MOVE'
    | 'INVALID_STATE'
    | 'STATE_VALIDATION_ERROR'
    | 'STATE_TRANSITION_ERROR'
    // Game errors
    | 'GAME_NOT_FOUND'
    | 'GAME_FULL'
    // System errors
    | 'STORAGE_ERROR'
    | 'UNKNOWN_ERROR';

/** Base network error interface */
export interface INetworkError {
    code: ErrorCode;
    message: string;
    severity: ErrorSeverity;
    recoverable?: boolean;
    retryCount?: number;
    timestamp?: number;
    details?: Record<string, unknown>;
}

/** Configuration for error recovery */
export interface IErrorRecoveryConfig {
    maxRetries?: number;
    retryDelay?: number;
    useBackoff?: boolean;
    recover?: (error: INetworkError) => Promise<void>;
}

/** Error response from server */
export interface IErrorResponse {
    code: number;
    message: string;
    details?: Record<string, unknown>;
}

/** Base validation error class */
export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}