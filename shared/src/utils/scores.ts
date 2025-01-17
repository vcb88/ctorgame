/**
 * Score management utilities
 */

import type { PlayerNumber, Scores as GameScores } from '../types/core.js';

/**
 * Create empty scores object
 */
export function createEmptyScores(): GameScores {
    return {
        player1: 0,
        player2: 0
    };
}

/**
 * Create scores with initial values
 */
export function createScores(player1Score: number, player2Score: number): GameScores {
    return {
        player1: player1Score,
        player2: player2Score
    };
}

/**
 * Update scores for a specific player
 */
export function updateScores(scores: GameScores, currentPlayer: PlayerNumber, points: number): GameScores {
    const updatedScores = { ...scores };
    if (currentPlayer === 1) {
        updatedScores.player1 = points;
    } else if (currentPlayer === 2) {
        updatedScores.player2 = points;
    }
    return updatedScores;
}

/**
 * Get total score (sum of both players)
 */
export function getTotalScore(scores: GameScores): number {
    return scores.player1 + scores.player2;
}

/**
 * Determine winner based on scores
 * Returns null for a draw
 */
export function getWinnerFromScores(scores: GameScores): PlayerNumber | null {
    if (scores.player1 > scores.player2) return 1;
    if (scores.player2 > scores.player1) return 2;
    return null;
}

/**
 * Type guard for scores object
 */
export function isValidScores(value: unknown): value is GameScores {
    if (!value || typeof value !== 'object') return false;
    const scores = value as Record<string, unknown>;
    return (
        typeof scores.player1 === 'number' &&
        typeof scores.player2 === 'number'
    );
}

/**
 * Get score for specific player
 */
export function getPlayerScore(scores: GameScores, player: PlayerNumber): number {
    return player === 1 ? scores.player1 : scores.player2;
}

/**
 * Compare scores to determine if they are equal
 */
export function areScoresEqual(a: GameScores, b: GameScores): boolean {
    return a.player1 === b.player1 && a.player2 === b.player2;
}