/**
 * Game state and move validation functions
 */

import type {
    IGameState,
    IGameMove,
    IGameScores,
    PlayerNumber,
    GameStatus,
    OperationType
} from '../types/game/types.js';
import type { IPosition, ISize } from '../types/geometry/types.js';
import { validatePosition, validateSize, isPosition } from './primitives.js';

/**
 * Validates a game move
 */
export function validateGameMove(move: IGameMove, size: ISize): boolean {
    return (
        isValidOperationType(move.type) &&
        isValidPlayerNumber(move.player) &&
        isPosition(move.position) &&
        validatePosition(move.position, size)
    );
}

/**
 * Validates complete game state
 */
export function validateGameState(state: IGameState): boolean {
    if (!state || typeof state !== 'object') return false;

    return (
        typeof state.id === 'string' &&
        Array.isArray(state.board) &&
        validateGameBoard(state.board) &&
        validateSize(state.size) &&
        isValidPlayerNumber(state.currentPlayer) &&
        isValidGameStatus(state.status) &&
        isValidScores(state.scores) &&
        typeof state.timestamp === 'number' &&
        (!state.lastMove || validateGameMove(state.lastMove, state.size))
    );
}

/**
 * Validates game board structure and contents
 */
function validateGameBoard(board: unknown): board is ReadonlyArray<ReadonlyArray<PlayerNumber | null>> {
    if (!Array.isArray(board)) return false;
    return board.every(row => 
        Array.isArray(row) &&
        row.every(cell => 
            cell === null || isValidPlayerNumber(cell)
        )
    );
}

/**
 * Type guards for game-specific types
 */
export function isValidPlayerNumber(value: unknown): value is PlayerNumber {
    return typeof value === 'number' && (value === 1 || value === 2);
}

export function isValidGameStatus(value: unknown): value is GameStatus {
    return typeof value === 'string' && 
           ['waiting', 'playing', 'finished'].includes(value);
}

export function isValidOperationType(value: unknown): value is OperationType {
    return typeof value === 'string' && 
           ['place', 'replace'].includes(value);
}

export function isValidScores(value: unknown): value is IGameScores {
    if (!value || typeof value !== 'object') return false;
    const scores = value as Record<string, unknown>;
    return (
        typeof scores.player1 === 'number' &&
        typeof scores.player2 === 'number'
    );
}

/**
 * Game state validation with detailed error messages
 */
export interface IValidationResult {
    readonly valid: boolean;
    readonly message?: string;
}

export function validateGameStateWithDetails(state: unknown): IValidationResult {
    if (!state || typeof state !== 'object') {
        return { valid: false, message: 'Invalid game state object' };
    }

    const s = state as Partial<IGameState>;

    if (typeof s.id !== 'string') {
        return { valid: false, message: 'Invalid game ID' };
    }

    if (!Array.isArray(s.board)) {
        return { valid: false, message: 'Invalid game board' };
    }

    if (!validateGameBoard(s.board)) {
        return { valid: false, message: 'Invalid board contents' };
    }

    if (!s.size || !validateSize(s.size)) {
        return { valid: false, message: 'Invalid board size' };
    }

    if (!isValidPlayerNumber(s.currentPlayer)) {
        return { valid: false, message: 'Invalid current player' };
    }

    if (!isValidGameStatus(s.status)) {
        return { valid: false, message: 'Invalid game status' };
    }

    if (!isValidScores(s.scores)) {
        return { valid: false, message: 'Invalid scores' };
    }

    if (typeof s.timestamp !== 'number') {
        return { valid: false, message: 'Invalid timestamp' };
    }

    if (s.lastMove && !validateGameMove(s.lastMove, s.size)) {
        return { valid: false, message: 'Invalid last move' };
    }

    return { valid: true };
}