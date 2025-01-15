import type { PlayerNumber, IGameScores } from '../types/shared.js';

/**
 * Returns the opponent's player number
 * @param playerNumber Current player's number
 * @returns Opponent's player number
 */
export function getOpponent(playerNumber: PlayerNumber): PlayerNumber {
    return playerNumber === 1 ? 2 : 1;
}

/**
 * Creates a new game scores object
 * @param player1 Score for player 1
 * @param player2 Score for player 2
 * @returns Game scores object
 */
export function createScores(player1: number, player2: number): IGameScores {
    return {
        player1,
        player2
    };
}