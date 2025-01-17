import type { GameHistory, GameMove } from '../types/core.js';

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
        (m.pos === undefined || (Array.isArray(m.pos) && m.pos.length === 2 && typeof m.pos[0] === 'number' && typeof m.pos[1] === 'number'))
    );
};

export const validateMove = validateGameMove;