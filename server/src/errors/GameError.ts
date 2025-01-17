import type { GameError as GameErrorType, ErrorCode, ErrorCategory, ErrorSeverity } from '@ctor-game/shared/types/core.js';

// Error categories
const ErrorCategories = {
    Network: 'network' as const,
    Game: 'game' as const,
    Validation: 'validation' as const,
    System: 'system' as const,
} as const;

// Error severity levels
const ErrorSeverities = {
    Info: 'info' as const,
    Warning: 'warning' as const,
    Error: 'error' as const,
    Critical: 'critical' as const,
} as const;

// Error codes
const ErrorCodes = {
    InvalidState: 'INVALID_STATE' as const,
    InvalidMove: 'INVALID_MOVE' as const,
    InvalidPosition: 'INVALID_POSITION' as const,
    NotYourTurn: 'NOT_YOUR_TURN' as const,
    GameEnded: 'GAME_ENDED' as const,
    GameNotFound: 'GAME_NOT_FOUND' as const,
    GameFull: 'GAME_FULL' as const,
    GameExpired: 'GAME_EXPIRED' as const,
    StorageError: 'STORAGE_ERROR' as const,
} as const;

/**
 * Base class for all game-related errors
 */
export class GameError extends Error {
    readonly code: ErrorCode;
    readonly category: ErrorCategory;
    readonly severity: ErrorSeverity;
    readonly details?: Record<string, unknown>;

    constructor(
        code: ErrorCode,
        message: string,
        options: {
            category?: ErrorCategory;
            severity?: ErrorSeverity;
            details?: Record<string, unknown>;
        } = {}
    ) {
        super(message);
        this.code = code;
        this.category = options.category ?? ErrorCategories.Game;
        this.severity = options.severity ?? ErrorSeverities.Error;
        this.details = options.details;
        this.name = 'GameError';
    }

    /**
     * Converts error to a format suitable for network transmission
     */
    toJSON(): GameErrorType {
        return {
            code: this.code,
            category: this.category,
            severity: this.severity,
            message: this.message,
            timestamp: Date.now(),
            details: this.details,
            stack: this.stack
        };
    }

    /**
     * Converts error to websocket format
     */
    toWebSocketError() {
        return {
            code: this.code as ErrorCode,
            message: this.message,
            details: this.details
        };
    }
    
    /**
     * Static helper to create GameError from error object
     */
    static from(error: unknown, defaultMessage = 'Unknown error'): GameError {
        if (error instanceof GameError) {
            return error;
        }

        const message = error instanceof Error ? error.message : defaultMessage;
        const details = error instanceof Error ? { stack: error.stack } : { cause: error };

        return new GameError('GAME_ERROR', message, {
            severity: 'error',
            details
        });
    }
}

/**
 * Error thrown when game state is invalid
 */
export class InvalidStateError extends GameError {
    constructor(message: string, details?: Record<string, unknown>) {
        super(ErrorCodes.InvalidState, message, {
            category: ErrorCategories.Validation,
            severity: ErrorSeverities.Error,
            details
        });
        this.name = 'InvalidStateError';
    }
}

/**
 * Error thrown when move is invalid
 */
export class InvalidMoveError extends GameError {
    constructor(message: string, details?: Record<string, unknown>) {
        super(ErrorCodes.InvalidMove, message, {
            category: ErrorCategories.Validation,
            severity: ErrorSeverities.Warning,
            details
        });
        this.name = 'InvalidMoveError';
    }
}

/**
 * Error thrown when position is invalid
 */
export class InvalidPositionError extends GameError {
    constructor(message: string = "Invalid position", details?: Record<string, unknown>) {
        super(ErrorCodes.InvalidPosition, message, {
            category: ErrorCategories.Validation,
            severity: ErrorSeverities.Warning,
            details
        });
        this.name = 'InvalidPositionError';
    }
}

/**
 * Error thrown when it's not player's turn
 */
export class NotYourTurnError extends GameError {
    constructor(message: string = "Not your turn", details?: Record<string, unknown>) {
        super(ErrorCodes.NotYourTurn, message, {
            category: ErrorCategories.Game,
            severity: ErrorSeverities.Warning,
            details
        });
        this.name = 'NotYourTurnError';
    }
}

/**
 * Error thrown when game is already ended
 */
export class GameEndedError extends GameError {
    constructor(message: string = "Game has ended", details?: Record<string, unknown>) {
        super(ErrorCodes.GameEnded, message, {
            category: ErrorCategories.Game,
            severity: ErrorSeverities.Info,
            details
        });
        this.name = 'GameEndedError';
    }
}

/**
 * Error thrown when game is not found
 */
export class GameNotFoundError extends GameError {
    constructor(message: string = "Game not found", details?: Record<string, unknown>) {
        super(ErrorCodes.GameNotFound, message, {
            category: ErrorCategories.Game,
            severity: ErrorSeverities.Error,
            details
        });
        this.name = 'GameNotFoundError';
    }
}

/**
 * Error thrown when game is full
 */
export class GameFullError extends GameError {
    constructor(message: string = "Game is full", details?: Record<string, unknown>) {
        super(ErrorCodes.GameFull, message, {
            category: ErrorCategories.Game,
            severity: ErrorSeverities.Warning,
            details
        });
        this.name = 'GameFullError';
    }
}

/**
 * Error thrown when game has expired
 */
export class GameExpiredError extends GameError {
    constructor(message: string = "Game has expired", details?: Record<string, unknown>) {
        super(ErrorCodes.GameExpired, message, {
            category: ErrorCategories.Game,
            severity: ErrorSeverities.Info,
            details
        });
        this.name = 'GameExpiredError';
    }
}

/**
 * Error thrown when storage operation fails
 */
export class StorageError extends GameError {
    constructor(message: string, details?: Record<string, unknown>) {
        super(ErrorCodes.StorageError, message, {
            category: ErrorCategories.System,
            severity: ErrorSeverities.Error,
            details
        });
        this.name = 'StorageError';
    }
}

/**
 * Error thrown when server operation fails
 */
export class ServerError extends GameError {
    constructor(message: string, details?: Record<string, unknown>) {
        super('SERVER_ERROR', message, {
            category: ErrorCategories.System,
            severity: ErrorSeverities.Error,
            details
        });
        this.name = 'ServerError';
    }
}