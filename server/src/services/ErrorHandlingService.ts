import { logger } from '../utils/logger';
import { GameError } from '../errors/GameError';
import type { IWebSocketErrorCode } from '@ctor-game/shared/types/network/websocket';

/**
 * Service for centralized error handling
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
    public handleError(error: Error | GameError): {
        code: IWebSocketErrorCode;
        message: string;
        details?: unknown;
    } {
        if (error instanceof GameError) {
            // Log game error
            logger.error(`Game error: ${error.code} - ${error.message}`, { component: 'ErrorHandler', error: error, details: error.details });
            return error.toJSON();
        }

        // Handle unknown errors
        logger.error('Unexpected error', { component: 'ErrorHandler', error: error });
        return {
            code: 'server_error',
            message: 'An unexpected error occurred',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        };
    }

    /**
     * Handles an error in async context
     */
    public async handleAsyncError<T>(
        operation: () => Promise<T>
    ): Promise<T> {
        try {
            return await operation();
        } catch (error) {
            const formattedError = this.handleError(error as Error);
            throw new GameError(
                formattedError.code,
                formattedError.message,
                formattedError.details
            );
        }
    }

    /**
     * Logs error for monitoring and analytics
     */
    public logError(
        error: Error | GameError,
        context?: Record<string, unknown>
    ): void {
        if (error instanceof GameError) {
            logger.error(
                `[${error.code}] ${error.message}`,
                { component: 'ErrorHandler', ...context, error: error, details: error.details }
            );
        } else {
            logger.error(
                'Unexpected error',
                { component: 'ErrorHandler', ...context, error: error }
            );
        }
    }
}