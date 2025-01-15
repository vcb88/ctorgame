import type { IGameState as IBaseGameState, IGameMove, PlayerNumber, GameStatus, ISize } from './shared';

// Расширенная версия IGameState для нашего приложения
export interface IGameState extends IBaseGameState {
    gameOver?: boolean;
    winner?: PlayerNumber | null;
    currentTurn?: {
        moves: IGameMove[];
    };
    scores: {
        player1: number;
        player2: number;
    };
}