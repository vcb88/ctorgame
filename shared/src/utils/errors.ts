import type { NetworkError } from '../types/core.js';

export type ErrorWithStack = Error & {
    stack: string;
    cause?: unknown;
};

export const isErrorWithStack = (error: unknown): error is ErrorWithStack => {
    return error instanceof Error && typeof (error as ErrorWithStack).stack === 'string';
};

export const getErrorDetails = (error: unknown): {
    message: string;
    stack?: string;
    cause?: unknown;
} => {
    if (isErrorWithStack(error)) {
        return {
            message: error.message,
            stack: error.stack,
            cause: error.cause
        };
    }
    
    if (error instanceof Error) {
        return {
            message: error.message
        };
    }
    
    if (typeof error === 'string') {
        return {
            message: error
        };
    }
    
    return {
        message: 'Unknown error',
        cause: error
    };
};

/**
 * Creates a standardized game error
 */
export const createGameError = (code: string, message: string, cause?: unknown): ErrorWithStack => {
    const error = new Error(message) as ErrorWithStack;
    error.name = code;
    if (cause) {
        error.cause = cause;
    }
    return error;
};

export const isNetworkError = (error: unknown): error is NetworkError => {
    return (
        typeof error === 'object' &&
        error !== null &&
        'category' in error &&
        (error as NetworkError).category === 'network'
    );
};

/** @deprecated Use ErrorWithStack type instead */
export const toErrorWithStack = (error: Error): ErrorWithStack => {
    return error as ErrorWithStack;
};