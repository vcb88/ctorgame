import { Scores } from '@ctor-game/shared/src/types/core';
import { Scores as OldScores } from '@ctor-game/shared/src/types/state';

/**
 * Converts IGameScores interface to Scores tuple
 */
export const adaptScores = (scores: OldScores): Scores => {
    return [scores.player1, scores.player2];
};