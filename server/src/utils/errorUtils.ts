/**
 * Utilities for error handling
 */

import { ErrorWithStack } from '@ctor-game/shared/types/core.js';

export function createErrorWithStack(error: unknown): ErrorWithStack {
    const defaultError = new Error('Unknown error');
    
    if (error instanceof Error) {
        const errorWithStack = Object.create(error);
        const extendedError = Object.assign(errorWithStack, {
            code: error.name,
            name: error.name,
            message: error.message,
            stack: error.stack || defaultError.stack || 'No stack trace available',
            cause: error.cause,
            category: 'system' as const,
            severity: 'error' as const
        });
        return extendedError;
    }
    
    const extendedError = Object.assign(defaultError, {
        code: 'UNKNOWN_ERROR',
        name: 'Error',
        message: String(error),
        category: 'system' as const,
        severity: 'error' as const
    });
    return extendedError;
}