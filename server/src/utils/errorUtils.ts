/**
 * Utilities for error handling
 */

import { ErrorWithStack } from '@ctor-game/shared/types/core.js';

export function createErrorWithStack(error: unknown): ErrorWithStack {
    const defaultError = new Error('Unknown error');
    
    if (error instanceof Error) {
        const errorWithStack = Object.create(error);
        return Object.assign(errorWithStack, {
            code: error.name,
            message: error.message,
            stack: error.stack || defaultError.stack || 'No stack trace available',
            cause: error.cause,
            category: 'system',
            severity: 'error'
        });
    }
    
    return Object.assign(defaultError, {
        code: 'UNKNOWN_ERROR',
        message: String(error),
        category: 'system',
        severity: 'error'
    });
}