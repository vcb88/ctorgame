/**
 * Simplified network error types
 */

/** Error codes with built-in category */
export type ErrorCode =
    // Connection errors (1xx)
    | 'ERR_100_CONNECTION_ERROR'
    | 'ERR_101_CONNECTION_TIMEOUT'
    | 'ERR_102_CONNECTION_LOST'
    // Game errors (2xx)
    | 'ERR_200_GAME_NOT_FOUND'
    | 'ERR_201_GAME_FULL'
    | 'ERR_202_INVALID_MOVE'
    | 'ERR_203_INVALID_STATE'
    // System errors (3xx)
    | 'ERR_300_STORAGE_ERROR'
    | 'ERR_301_OPERATION_FAILED'
    | 'ERR_302_OPERATION_TIMEOUT'
    | 'ERR_999_UNKNOWN_ERROR';

/** Simple error type */
export type GameError = {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
};

/** Error recovery configuration */
export type ErrorRecovery = {
    maxRetries: number;
    retryDelay: number;
    useBackoff: boolean;
};

/** Default error recovery config */
export const DEFAULT_ERROR_RECOVERY: ErrorRecovery = {
    maxRetries: 3,
    retryDelay: 1000,
    useBackoff: true,
};

/** Error utilities */
export const isNetworkError = (code: ErrorCode): boolean => code.startsWith('ERR_1');
export const isGameError = (code: ErrorCode): boolean => code.startsWith('ERR_2');
export const isSystemError = (code: ErrorCode): boolean => code.startsWith('ERR_3');

/** Error factory */
export const createError = (
    code: ErrorCode,
    message: string,
    details?: Record<string, unknown>
): GameError => ({
    code,
    message,
    details
});