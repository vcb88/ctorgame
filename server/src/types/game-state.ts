import type { IGameState as BaseGameState, IGameMove as GameMove, PlayerNumber, GameStatus } from '@ctor-game/shared/types/game/types.js';
import type { ISize as Size } from '@ctor-game/shared/types/geometry/types.js';

// Extended version of GameState for our application
export interface GameState extends BaseGameState {
    gameOver?: boolean;
    winner?: PlayerNumber | null;
    currentTurn?: {
        moves: GameMove[];
    };
    scores: {
        player1: number;
        player2: number;
    };
}