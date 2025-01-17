import type { ValidationResult, GameMove, GameState } from '../types/base/types.js';

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
export const validateGameState = (state: GameState): GameValidationResult => {
    // Basic validation
    if (!state) {
        return {
            isValid: false,
            errors: [],
            message: 'Invalid state',
            details: {
                reason: 'INVALID_STATE'
            }
        };
    }

    // Required fields validation
    if (!state.id || !state.board || !state.players || !state.scores || !state.size) {
        return {
            isValid: false,
            errors: ['Missing required fields'],
            message: 'State is missing required fields',
            state,
            details: {
                reason: 'MISSING_FIELDS'
            }
        };
    }

    // Add more validation rules as needed...

    return {
        isValid: true,
        errors: [],
        state
    };
};

export const validateMove = (move: GameMove, state: GameState): GameValidationResult => {
    // Basic validation
    if (!move || !state) {
        return {
            isValid: false,
            errors: [],
            message: 'Invalid move or state',
            details: {
                reason: 'INVALID_INPUT'
            }
        };
    }

    // Game must be active
    if (state.status !== 'active') {
        return {
            isValid: false,
            errors: [],
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
        isValid: true,
        errors: [],
        state,
        move
    };
};