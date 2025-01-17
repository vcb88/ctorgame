import type { GameError } from '@ctor-game/shared/types/core.js';

export enum ErrorCode {
    CONNECTION_ERROR = 'CONNECTION_ERROR',
    CONNECTION_TIMEOUT = 'CONNECTION_TIMEOUT',
    OPERATION_TIMEOUT = 'OPERATION_TIMEOUT',
    CONNECTION_LOST = 'CONNECTION_LOST',
    STATE_VALIDATION_ERROR = 'STATE_VALIDATION_ERROR',
    INVALID_MOVE = 'INVALID_MOVE',
    NOT_YOUR_TURN = 'NOT_YOUR_TURN',
    GAME_ENDED = 'GAME_ENDED',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export enum ErrorSeverity {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH'
}

/**
 * Client-side error type extending GameError from core
 */
export interface BaseError {
    code: ErrorCode;
    message: string;
    details: Record<string, unknown>;
    category: string;
    retryable?: boolean;
}

export type ClientError = BaseError & {
    /** Error severity level */
    severity: ErrorSeverity;
    /** Stack trace if available */
    stack?: string;
};

/**
 * Error handler configuration
 */
export type ErrorHandlerConfig = {
    /** Maximum number of retries */
    maxRetries: number;
    /** Base delay between retries in ms */
    retryDelay: number;
    /** Maximum retry delay in ms */
    maxRetryDelay: number;
    /** Maximum recovery attempts */
    maxRecoveryAttempts: number;
};

/**
 * Error recovery strategy type
 */
export type ErrorRecoveryStrategy = {
    /** Error codes that can be handled by this strategy */
    codes: ErrorCode[];
    /** Should retry the operation */
    shouldRetry: boolean;
    /** Should attempt to recover game state */
    shouldRecover: boolean;
    /** Retry configuration */
    retryConfig?: {
        maxRetries?: number;
        retryDelay?: number;
    };
    /** Recovery handler */
    recover?: () => Promise<void>;
};

/**
 * Default recovery strategies for different error types
 */
export const defaultRecoveryStrategies: readonly ErrorRecoveryStrategy[] = [
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
] as const;

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

    const baseError: ClientError = {
        code: ErrorCode.UNKNOWN_ERROR,
        severity: ErrorSeverity.HIGH,
        message: 'An unknown error occurred',
        details: {},
        category: 'client'
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