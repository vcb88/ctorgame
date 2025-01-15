/**
 * Network and game error types
 */

import type { Position, PlayerNumber } from '../core.js';

/** Error categories */
export type ErrorCategory = 'network' | 'game' | 'validation' | 'system';

/** Specific error codes */
export type ErrorCode = 
    // Network errors
    | 'connection_error'
    | 'connection_timeout'
    | 'connection_lost'
    // Game errors
    | 'game_not_found'
    | 'game_full'
    | 'game_ended'
    | 'game_expired'
    // Validation errors
    | 'invalid_move'
    | 'invalid_state'
    | 'invalid_position'
    | 'not_your_turn'
    // System errors
    | 'storage_error'
    | 'operation_failed'
    | 'operation_timeout'
    | 'internal_error'
    | 'unknown_error';

/** Error severity levels */
export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

/** Error response type */
export type ErrorResponse = NetworkError;

/** Validation error class */
export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

/** Network error type with detailed information */
export type NetworkError = {
    readonly code: ErrorCode;
    readonly category: ErrorCategory;
    readonly severity: ErrorSeverity;
    readonly message: string;
    readonly timestamp: number;
    readonly details?: {
        readonly gameId?: UUID;
        readonly playerId?: UUID;
        readonly playerNumber?: PlayerNumber;
        readonly position?: Position;
        readonly state?: string;
        readonly [key: string]: unknown;
    };
};

/** Error recovery configuration */
export type ErrorRecovery = {
    readonly maxRetries: number;
    readonly retryDelay: number;
    readonly useBackoff: boolean;
    readonly backoffMultiplier?: number;
    readonly maxDelay?: number;
};

/** Default error recovery config */
export const DEFAULT_ERROR_RECOVERY: ErrorRecovery = {
    maxRetries: 3,
    retryDelay: 1000,
    useBackoff: true,
    backoffMultiplier: 2,
    maxDelay: 10000
};

/** Error type guards */
export const isNetworkError = (error: unknown): error is NetworkError => {
    return typeof error === 'object' && error !== null &&
           'code' in error && 'category' in error &&
           'severity' in error && 'message' in error &&
           'timestamp' in error;
};

/** Error category checks */
export const isNetworkCategory = (error: NetworkError): boolean => 
    error.category === ErrorCategory.Network;

export const isGameCategory = (error: NetworkError): boolean => 
    error.category === ErrorCategory.Game;

export const isValidationCategory = (error: NetworkError): boolean => 
    error.category === ErrorCategory.Validation;

export const isSystemCategory = (error: NetworkError): boolean => 
    error.category === ErrorCategory.System;

/** Error factory */
export const createError = (
    code: ErrorCode,
    message: string,
    options: {
        category?: ErrorCategory;
        severity?: ErrorSeverity;
        details?: NetworkError['details'];
    } = {}
): NetworkError => ({
    code,
    category: options.category ?? getCategoryFromCode(code),
    severity: options.severity ?? getSeverityFromCode(code),
    message,
    timestamp: Date.now(),
    details: options.details
});

/** Helper functions */
const getCategoryFromCode = (code: ErrorCode): ErrorCategory => {
    if (code.startsWith('connection_')) return ErrorCategory.Network;
    if (code.startsWith('game_')) return ErrorCategory.Game;
    if (code.startsWith('invalid_')) return ErrorCategory.Validation;
    return ErrorCategory.System;
};

const getSeverityFromCode = (code: ErrorCode): ErrorSeverity => {
    switch (code) {
        case ErrorCode.ConnectionLost:
        case ErrorCode.GameEnded:
        case ErrorCode.InvalidMove:
        case ErrorCode.NotYourTurn:
            return ErrorSeverity.Warning;
        case ErrorCode.StorageError:
        case ErrorCode.OperationFailed:
        case ErrorCode.InternalError:
            return ErrorSeverity.Error;
        case ErrorCode.UnknownError:
            return ErrorSeverity.Critical;
        default:
            return ErrorSeverity.Info;
    }
};