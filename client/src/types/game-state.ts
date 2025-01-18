import type { Board } from './board.js';
import type { PlayerNumber, GameStage } from '@ctor-game/shared/types/core.js';

export interface GameState {
    board: Board;
    currentPlayer: PlayerNumber;
    phase: GameStage;
    winner: PlayerNumber | null;
    scores: [number, number];
    movesLeft: number;
    isFirstTurn: boolean;
}