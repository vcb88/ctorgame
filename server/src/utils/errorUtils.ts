/**
 * Utilities for error handling
 */

import { ErrorWithStack } from '@ctor-game/shared/types/core.js';

export function createErrorWithStack(error: unknown): ErrorWithStack {
    const defaultMessage = 'Unknown error';
    const defaultStack = new Error().stack || 'No stack trace available';
    
    if (error instanceof Error) {
        return {
            code: error.name,
            message: error.message,
            stack: error.stack || defaultStack,
            cause: error.cause,
            category: 'system' as const,
            severity: 'error' as const,
            name: error.name || 'SystemError'
        };
    }
    
    return {
        code: 'UNKNOWN_ERROR',
        message: String(error) || defaultMessage,
        stack: defaultStack,
        category: 'system' as const,
        severity: 'error' as const,
        name: 'SystemError'
    };
}