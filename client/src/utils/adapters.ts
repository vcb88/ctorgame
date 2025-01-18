import { Scores, GameScores } from '@ctor-game/shared/types/core.js';

/**
 * Converts GameScores interface to Scores tuple
 */
export const adaptScores = (scores: GameScores): Scores => {
    return [scores.player1, scores.player2];
};