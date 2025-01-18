import type { Scores, PlayerNumber } from '@ctor-game/shared/types/base/types.js';

type GameScores = {
    [key in PlayerNumber]: number;
};

/**
 * Converts GameScores interface to Scores tuple
 */
export const adaptScores = (scores: GameScores): Scores => {
    return [scores.player1, scores.player2];
};