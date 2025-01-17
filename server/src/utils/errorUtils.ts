/**
 * Utilities for error handling
 */

import { ErrorWithStack } from '@ctor-game/shared/types/core.js';

export function createErrorWithStack(error: unknown): ErrorWithStack {
    if (error instanceof Error) {
        return {
            code: error.name,
            message: error.message,
            stack: error.stack || new Error().stack || 'No stack trace available',
            cause: error.cause,
            category: 'system',
            severity: 'error'
        };
    }
    
    const defaultError = new Error('Unknown error');
    return {
        code: 'UNKNOWN_ERROR',
        message: String(error),
        stack: defaultError.stack || 'No stack trace available',
        category: 'system',
        severity: 'error'
    };
}