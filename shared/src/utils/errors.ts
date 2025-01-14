/**
 * Error utilities for consistent error handling across the application
 */

/** Extended error interface that includes stack trace */
export interface IErrorWithStack extends Error {
    readonly code?: string | number;
    readonly type?: string;
    readonly [key: string]: unknown;
}

/**
 * Convert any error to ErrorWithStack format
 * Used primarily for logging purposes to ensure consistent error structure
 */
export function toErrorWithStack(error: unknown): IErrorWithStack {
    if (error instanceof Error) {
        return {
            ...error,
            message: error.message,
            stack: error.stack,
            type: error.constructor.name,
            toString: () => error.toString()
        };
    }
    return {
        name: 'UnknownError',
        message: String(error),
        stack: new Error().stack,
        type: typeof error,
        toString: () => String(error)
    } as IErrorWithStack;
}