import { Logger } from '../utils/logger.js';
import { GameError } from '../errors/GameError.js';
import type { WebSocketErrorCode } from '@ctor-game/shared/src/types/network/websocket.js';

/**
 * Service for centralized error handling
 */
export class ErrorHandlingService {
    private static instance: ErrorHandlingService;
    private logger: Logger;

    private constructor() {
        this.logger = new Logger('ErrorHandlingService');
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
        code: WebSocketErrorCode;
        message: string;
        details?: unknown;
    } {
        if (error instanceof GameError) {
            // Log game error
            this.logger.error(`Game error: ${error.code} - ${error.message}`, error.details);
            return error.toJSON();
        }

        // Handle unknown errors
        this.logger.error('Unexpected error:', error);
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
            this.logger.error(
                `[${error.code}] ${error.message}`,
                { ...context, details: error.details }
            );
        } else {
            this.logger.error(
                'Unexpected error:',
                { ...context, error: error.message, stack: error.stack }
            );
        }
    }
}