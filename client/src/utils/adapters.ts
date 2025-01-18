import type { Scores, PlayerNumber } from '@ctor-game/shared/types/base/types.js';

type GameScores = {
    [key in PlayerNumber]: number;
};

/**
 * Converts GameScores interface to Scores tuple
 */
export const adaptScores = (scores: GameScores): Scores => {
    return [scores[1], scores[2]];  // Using numeric indices matching PlayerNumber type
};