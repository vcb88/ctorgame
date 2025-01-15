import { logger } from '../utils/logger.js';
import { GameError } from '../errors/GameError.js';
import {
    NetworkError,
    ErrorCode,
    ErrorCategory,
    ErrorSeverity,
    createError,
    isNetworkError
} from '@ctor-game/shared/types/network/errors';

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
    public handleError(error: Error | GameError | NetworkError): NetworkError {
        // If it's already a NetworkError, just return it
        if (isNetworkError(error)) {
            this.logError(error);
            return error;
        }

        // If it's a GameError, convert it to NetworkError
        if (error instanceof GameError) {
            const networkError = createError(
                error.code as ErrorCode,
                error.message,
                {
                    category: ErrorCategory.Game,
                    severity: ErrorSeverity.Error,
                    details: error.details
                }
            );
            this.logError(networkError);
            return networkError;
        }

        // Handle unknown errors
        const networkError = createError(
            ErrorCode.InternalError,
            'An unexpected error occurred',
            {
                category: ErrorCategory.System,
                severity: ErrorSeverity.Critical,
                details: process.env.NODE_ENV === 'development' 
                    ? { originalError: error.message, stack: error.stack }
                    : undefined
            }
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
            category?: ErrorCategory;
        } = {}
    ): Promise<T> {
        const maxRetries = options.maxRetries ?? 3;
        const retryDelay = options.retryDelay ?? 1000;
        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error as Error;
                
                // Don't retry if it's a game logic error
                if (error instanceof GameError && error.code !== ErrorCode.OperationTimeout) {
                    throw this.handleError(error);
                }

                // Last attempt failed
                if (attempt === maxRetries) {
                    const networkError = this.handleError(lastError);
                    throw networkError;
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
        error: Error | GameError | NetworkError,
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

        if (error instanceof GameError) {
            logger.error(
                `[game:${error.code}] ${error.message}`,
                { ...logContext, details: error.details }
            );
            return;
        }

        logger.error(
            'Unexpected error',
            { ...logContext, error: error }
        );
    }
}