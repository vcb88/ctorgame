import { ErrorCode, ErrorCategory, ErrorSeverity } from '@ctor-game/shared/types/network/errors';

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
        this.category = options.category ?? ErrorCategory.Game;
        this.severity = options.severity ?? ErrorSeverity.Error;
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
        super(ErrorCode.InvalidState, message, {
            category: ErrorCategory.Validation,
            severity: ErrorSeverity.Error,
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
        super(ErrorCode.InvalidMove, message, {
            category: ErrorCategory.Validation,
            severity: ErrorSeverity.Warning,
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
        super(ErrorCode.InvalidPosition, message, {
            category: ErrorCategory.Validation,
            severity: ErrorSeverity.Warning,
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
        super(ErrorCode.NotYourTurn, message, {
            category: ErrorCategory.Game,
            severity: ErrorSeverity.Warning,
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
        super(ErrorCode.GameEnded, message, {
            category: ErrorCategory.Game,
            severity: ErrorSeverity.Info,
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
        super(ErrorCode.GameNotFound, message, {
            category: ErrorCategory.Game,
            severity: ErrorSeverity.Error,
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
        super(ErrorCode.GameFull, message, {
            category: ErrorCategory.Game,
            severity: ErrorSeverity.Warning,
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
        super(ErrorCode.GameExpired, message, {
            category: ErrorCategory.Game,
            severity: ErrorSeverity.Info,
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
        super(ErrorCode.StorageError, message, {
            category: ErrorCategory.System,
            severity: ErrorSeverity.Error,
            details
        });
        this.name = 'StorageError';
    }
}