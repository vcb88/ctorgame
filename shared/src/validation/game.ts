import type { ValidationResult, GameMove, GameState } from '../types/core.js';

export type GameValidationResult = ValidationResult & {
    state?: GameState;
    move?: GameMove;
    details?: {
        reason?: string;
        code?: string;
        [key: string]: unknown;
    };
};

/**
 * Validates a game move
 */
export const validateMove = (move: GameMove, state: GameState): GameValidationResult => {
    // Basic validation
    if (!move || !state) {
        return {
            valid: false,
            message: 'Invalid move or state',
            details: {
                reason: 'INVALID_INPUT'
            }
        };
    }

    // Game must be active
    if (state.status !== 'active') {
        return {
            valid: false,
            message: 'Game is not active',
            state,
            move,
            details: {
                reason: 'GAME_NOT_ACTIVE',
                status: state.status
            }
        };
    }

    // Add more validation rules as needed...

    return {
        valid: true,
        state,
        move
    };
};