import type { GameMove, GameHistory } from '../types/base/types.js';

export const validateGameHistoryEntry = (history: GameHistory): boolean => {
    // Basic structure validation
    return true; // MVP - minimal validation for now
};

export const validateGameMove = (move: unknown): move is GameMove => {
    if (!move || typeof move !== 'object') {
        return false;
    }
    const m = move as GameMove;
    return (
        typeof m.type === 'string' &&
        (m.type === 'place' || m.type === 'replace' || m.type === 'skip') &&
        (m.position === undefined || (Array.isArray(m.position) && m.position.length === 2 && typeof m.position[0] === 'number' && typeof m.position[1] === 'number'))
    );
};

export const validateMove = validateGameMove;