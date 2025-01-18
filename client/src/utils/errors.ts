import type { ErrorCode, ErrorSeverity, NetworkError } from '@ctor-game/shared/types/core.js';

interface NetworkErrorDetails {
    [key: string]: unknown;
}

export function createNetworkError(
    code: ErrorCode,
    message: string,
    severity: ErrorSeverity = 'error',
    details?: NetworkErrorDetails,
    retryable?: boolean,
    retryCount?: number
): NetworkError {
    const error = new Error(message);
    return {
        category: 'network',
        code,
        severity,
        message,
        details,
        retryable,
        retryCount,
        timestamp: Date.now(),
        stack: error.stack || '',
        name: 'NetworkError'
    };
}