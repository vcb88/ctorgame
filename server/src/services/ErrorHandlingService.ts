import { logger } from '../utils/logger.js';
import type { NetworkError, ErrorCode, ErrorSeverity, ErrorCategory } from '@ctor-game/shared/types/core.js';
import { isNetworkError } from '@ctor-game/shared/utils/errors.js';
import { GameError } from '../errors/GameError.js';

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

    private static convertGameErrorToNetworkError(error: GameError): NetworkError {
        return {
            code: error.code,
            message: error.message,
            category: 'network',
            severity: error.severity,
            details: {
                ...(error.details || {}),
                originalCategory: error.category,
                requiresUserAction: error.severity === 'critical'
            },
            stack: error.stack || 'No stack trace available',
            name: 'NetworkError',
            retryCount: error.retryCount ?? 0,
            retryable: error.recoverable ?? false,
            timestamp: Date.now()
        };
    }

    /**
     * Creates a NetworkError with the given parameters
     */
    public static createNetworkError(
        code: ErrorCode,
        message: string,
        severity: ErrorSeverity = 'error',
        details?: Record<string, unknown>,
        name: string = 'NetworkError',
        options: {
            retryable?: boolean;
            retryCount?: number;
        } = {}
    ): NetworkError {
        const { retryable = true, retryCount = 0 } = options;
        return {
            code,
            message,
            category: 'network',
            severity,
            details: {
                ...details,
                requiresUserAction: severity === 'critical'
            },
            stack: new Error().stack || 'No stack trace available',
            name,
            timestamp: Date.now(),
            retryable,
            retryCount
        };
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
            const networkError = ErrorHandlingService.convertGameErrorToNetworkError(error);
            this.logError(networkError);
            return networkError;
        }

        // Convert Error objects
        if (error instanceof Error) {
            const networkError = ErrorHandlingService.createNetworkError(
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
        const networkError = ErrorHandlingService.createNetworkError(
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
            useBackoff?: boolean;
        } = {}
    ): Promise<T> {
        const maxRetries = options.maxRetries ?? 3;
        const retryDelay = options.retryDelay ?? 1000;
        const useBackoff = options.useBackoff ?? true;
        let lastError: unknown = null;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                
                // Handle NetworkError specifically
                if (isNetworkError(error)) {
                    // Update retryCount and check if we should continue retrying
                    const networkError = {
                        ...error,
                        retryCount: (error.retryCount || 0) + 1,
                        timestamp: Date.now()
                    };

                    // Stop if max retries reached or error is not retryable
                    if (!error.retryable || networkError.retryCount >= maxRetries) {
                        networkError.retryable = false;
                        throw networkError;
                    }

                    // Log retry attempt
                    logger.debug('Retrying operation after error', {
                        attempt,
                        maxRetries,
                        errorCode: error.code,
                        retryCount: networkError.retryCount
                    });

                    const delay = useBackoff
                        ? retryDelay * Math.pow(2, attempt)
                        : retryDelay;

                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }

                // Last attempt failed
                if (attempt === maxRetries) {
                    throw this.handleError(lastError);
                }

                // Wait before retry
                const delay = useBackoff
                    ? retryDelay * Math.pow(2, attempt)
                    : retryDelay;
                await new Promise(resolve => setTimeout(resolve, delay));
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
            { 
                ...logContext, 
                error: error instanceof Error ? { 
                    name: error.name,
                    message: error.message,
                    stack: error.stack || 'No stack available',
                    cause: error.cause
                } : { 
                    name: 'UnknownError',
                    message: 'Unknown error',
                    stack: 'No stack available'
                }
            }
        );
    }
}