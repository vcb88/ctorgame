import { Scores } from '@ctor-game/shared/src/types/core';
import { IGameScores } from '@ctor-game/shared/src/types/state';

/**
 * Converts IGameScores interface to Scores tuple
 */
export const adaptScores = (scores: IGameScores): Scores => {
    return [scores.player1, scores.player2];
};