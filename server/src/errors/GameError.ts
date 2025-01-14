import { WebSocketErrorCode } from '@ctor-game/shared/src/types/network/websocket.js';

/**
 * Base class for all game-related errors
 */
export class GameError extends Error {
    readonly code: WebSocketErrorCode;
    readonly details?: unknown;

    constructor(code: WebSocketErrorCode, message: string, details?: unknown) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'GameError';
    }

    /**
     * Converts error to a format suitable for sending to client
     */
    toJSON() {
        return {
            code: this.code,
            message: this.message,
            details: this.details
        };
    }
}

/**
 * Error thrown when game state is invalid
 */
export class InvalidGameStateError extends GameError {
    constructor(message: string, details?: unknown) {
        super('invalid_state', message, details);
        this.name = 'InvalidGameStateError';
    }
}

/**
 * Error thrown when move is invalid
 */
export class InvalidMoveError extends GameError {
    constructor(message: string, details?: unknown) {
        super('invalid_move', message, details);
        this.name = 'InvalidMoveError';
    }
}

/**
 * Error thrown when it's not player's turn
 */
export class NotYourTurnError extends GameError {
    constructor(message: string = "Not your turn", details?: unknown) {
        super('not_your_turn', message, details);
        this.name = 'NotYourTurnError';
    }
}

/**
 * Error thrown when game is already ended
 */
export class GameEndedError extends GameError {
    constructor(message: string = "Game has ended", details?: unknown) {
        super('game_ended', message, details);
        this.name = 'GameEndedError';
    }
}

/**
 * Error thrown when game is not found
 */
export class GameNotFoundError extends GameError {
    constructor(message: string = "Game not found", details?: unknown) {
        super('game_not_found', message, details);
        this.name = 'GameNotFoundError';
    }
}

/**
 * Error thrown when game is full
 */
export class GameFullError extends GameError {
    constructor(message: string = "Game is full", details?: unknown) {
        super('game_full', message, details);
        this.name = 'GameFullError';
    }
}