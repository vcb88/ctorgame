import type { ErrorCode, ErrorCategory, ErrorSeverity } from '@ctor-game/shared/src/types/core.js';

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
    InvalidState: 'invalid_state' as const,
    InvalidMove: 'invalid_move' as const,
    InvalidPosition: 'invalid_position' as const,
    NotYourTurn: 'not_your_turn' as const,
    GameEnded: 'game_ended' as const,
    GameNotFound: 'game_not_found' as const,
    GameFull: 'game_full' as const,
    GameExpired: 'game_expired' as const,
    StorageError: 'storage_error' as const,
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
    toJSON() {
        return {
            code: this.code,
            category: this.category,
            severity: this.severity,
            message: this.message,
            timestamp: Date.now(),
            details: this.details
        };
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