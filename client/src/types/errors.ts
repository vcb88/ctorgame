import type { ErrorCode, ErrorSeverity } from '@ctor-game/shared/types/enums.js';

/**
 * Client-side error type
 */
export interface ClientError {
    /** Error code from shared types */
    readonly code: ErrorCode;
    /** Human-readable error message */
    readonly message: string;
    /** Error severity level */
    readonly severity: ErrorSeverity;
    /** Additional error details */
    readonly details?: Record<string, unknown>;
    /** Stack trace if available */
    readonly stack?: string;
}

/**
 * Error handler configuration
 */
export interface ErrorHandlerConfig {
    /** Maximum number of retries */
    readonly maxRetries: number;
    /** Base delay between retries in ms */
    readonly retryDelay: number;
    /** Maximum retry delay in ms */
    readonly maxRetryDelay: number;
    /** Maximum recovery attempts */
    readonly maxRecoveryAttempts: number;
}

/**
 * Error recovery strategy type
 */
export type ErrorRecoveryStrategy = {
    /** Error codes that can be handled by this strategy */
    readonly codes: ErrorCode[];
    /** Should retry the operation */
    readonly shouldRetry: boolean;
    /** Should attempt to recover game state */
    readonly shouldRecover: boolean;
    /** Retry configuration */
    readonly retryConfig?: {
        /** Maximum number of retries for this strategy */
        readonly maxRetries?: number;
        /** Base delay between retries */
        readonly retryDelay?: number;
    };
    /** Recovery handler */
    readonly recover?: () => Promise<void>;
};

/**
 * Default recovery strategies for different error types
 */
export const defaultRecoveryStrategies: ErrorRecoveryStrategy[] = [
    {
        codes: [
            ErrorCode.CONNECTION_ERROR,
            ErrorCode.CONNECTION_TIMEOUT,
            ErrorCode.OPERATION_TIMEOUT
        ],
        shouldRetry: true,
        shouldRecover: false,
        retryConfig: {
            maxRetries: 3,
            retryDelay: 1000
        }
    },
    {
        codes: [
            ErrorCode.CONNECTION_LOST,
            ErrorCode.STATE_VALIDATION_ERROR
        ],
        shouldRetry: false,
        shouldRecover: true
    },
    {
        codes: [
            ErrorCode.INVALID_MOVE,
            ErrorCode.NOT_YOUR_TURN,
            ErrorCode.GAME_ENDED
        ],
        shouldRetry: false,
        shouldRecover: false
    }
];

/**
 * Type guard for client errors
 */
export const isClientError = (error: unknown): error is ClientError => {
    if (!error || typeof error !== 'object') {
        return false;
    }

    const { code, message, severity } = error as ClientError;
    return (
        typeof code === 'string' &&
        typeof message === 'string' &&
        typeof severity === 'string' &&
        Object.values(ErrorCode).includes(code) &&
        Object.values(ErrorSeverity).includes(severity)
    );
};

/**
 * Create a client error from any error type
 */
export const createClientError = (error: unknown): ClientError => {
    if (isClientError(error)) {
        return error;
    }

    const baseError = {
        code: ErrorCode.UNKNOWN_ERROR,
        severity: ErrorSeverity.HIGH,
        message: 'An unknown error occurred'
    };

    if (error instanceof Error) {
        return {
            ...baseError,
            message: error.message,
            stack: error.stack
        };
    }

    if (typeof error === 'string') {
        return {
            ...baseError,
            message: error
        };
    }

    return {
        ...baseError,
        details: { originalError: error }
    };
};