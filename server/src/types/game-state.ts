import type { GameState as BaseGameState, GameMove, PlayerNumber, GameStatus, Size } from './shared.js';

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