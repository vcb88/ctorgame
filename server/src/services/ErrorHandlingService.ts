import { logger } from '../utils/logger.js';
import type { NetworkError, ErrorCode, ErrorSeverity, ErrorCategory } from '@ctor-game/shared/types/core.js';
import { isNetworkError } from '@ctor-game/shared/utils/errors.js';
import { GameError } from '../errors/GameError.js';

const convertGameErrorToNetworkError = (error: GameError): NetworkError => ({
    code: error.code,
    message: error.message,
    category: 'network',
    severity: error.severity,
    details: error.details,
    stack: error.stack,
    cause: undefined,  // NetworkError doesn't include cause
    timestamp: Date.now()
});

const createNetworkError = (
    code: ErrorCode,
    message: string,
    severity: ErrorSeverity = 'error',
    details?: Record<string, unknown>
): NetworkError => ({
    code,
    message,
    category: 'network',
    severity,
    details,
    timestamp: Date.now()
});

/**
 * Service for centralized error handling and monitoring
 */
export class ErrorHandlingService {
    private static instance: ErrorHandlingService;
    private constructor() {
        // Using the global logger instance
    }

    public static getInstance(): ErrorHandlingService {
        if (!ErrorHandlingService.instance) {
            ErrorHandlingService.instance = new ErrorHandlingService();
        }
        return ErrorHandlingService.instance;
    }

    /**
     * Handles an error and returns formatted error response
     */
    public handleError(error: unknown): NetworkError {
        // If it's already a NetworkError, return it
        if (isNetworkError(error)) {
            this.logError(error);
            return error;
        }

        if (error instanceof GameError) {
            const networkError = convertGameErrorToNetworkError(error);
            this.logError(networkError);
            return networkError;
        }

        // Convert Error objects
        if (error instanceof Error) {
            const networkError = createNetworkError(
                'INTERNAL_ERROR',
                error.message,
                'error',
                {
                    stack: error.stack,
                    cause: error.cause
                }
            );
            this.logError(networkError);
            return networkError;
        }

        // Handle unknown errors
        const networkError = createNetworkError(
            'INTERNAL_ERROR',
            'An unexpected error occurred',
            'critical',
            { originalError: error }
        );
        this.logError(networkError);
        return networkError;
    }

    /**
     * Handles an error in async context with retries
     */
    public async handleAsyncError<T>(
        operation: () => Promise<T>,
        options: {
            maxRetries?: number;
            retryDelay?: number;
        } = {}
    ): Promise<T> {
        const maxRetries = options.maxRetries ?? 3;
        const retryDelay = options.retryDelay ?? 1000;
        let lastError: unknown = null;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                
                // Don't retry if it's already a NetworkError
                if (isNetworkError(error)) {
                    throw error;
                }

                // Last attempt failed
                if (attempt === maxRetries) {
                    throw this.handleError(lastError);
                }

                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
            }
        }

        // This should never happen due to the loop above
        throw this.handleError(new Error('Unexpected error in retry loop'));
    }

    /**
     * Logs error for monitoring and analytics
     */
    public logError(
        error: unknown,
        context?: Record<string, unknown>
    ): void {
        const logContext = {
            component: 'ErrorHandler',
            ...context
        };

        if (isNetworkError(error)) {
            logger.error(
                `[${error.category}:${error.code}] ${error.message}`,
                { 
                    ...logContext,
                    severity: error.severity,
                    details: error.details,
                    timestamp: error.timestamp
                }
            );
            return;
        }

        if (error instanceof Error) {
            logger.error(
                `[error] ${error.message}`,
                { 
                    ...logContext,
                    stack: error?.stack,
                    cause: error instanceof Error ? error.cause : undefined
                }
            );
            return;
        }

        logger.error(
            'Unexpected error',
            { ...logContext, error }
        );
    }
}