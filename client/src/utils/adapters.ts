import { Scores } from '@ctor-game/shared/types/core.js';
import { Scores as OldScores } from '@ctor-game/shared/types/state.js';

/**
 * Converts IGameScores interface to Scores tuple
 */
export const adaptScores = (scores: OldScores): Scores => {
    return [scores.player1, scores.player2];
};