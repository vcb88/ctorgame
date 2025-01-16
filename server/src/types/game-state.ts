import type { GameState as BaseGameState, GameMove, PlayerNumber, GameStatus, Scores } from '@ctor-game/shared/src/types/core.js';

// Extended version of GameState for server application
export type GameState = BaseGameState & {
    gameOver?: boolean;
    winner?: PlayerNumber | null;
    currentTurn?: {
        moves: GameMove[];
    };
    scores: Scores;
};