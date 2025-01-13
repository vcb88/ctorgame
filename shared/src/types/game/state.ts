import {
    ICell
} from '../core.js';
import { Player } from '../base/enums.js';
import { IBoardSize } from '../base/primitives.js';
import { IBasicMove } from './moves.js';".js"

// Board interfaces
export interface IBoardBase {
    readonly size: IBoardSize;
    cells: Array<Array<ICell['value']>>;
}

export interface IBoard extends IBoardBase {}

// Score interfaces
export interface IBasicScores {
    readonly player1: number;
    readonly player2: number;
}

export interface IScores extends IBasicScores {
    readonly [Player.First]: number;
    readonly [Player.Second]: number;
}

// Turn state interfaces
// Basic turn state with operation counts
export interface ITurnStateBase {
    readonly placeOperationsLeft: number;
    readonly replaceOperationsLeft: number;
}

// Turn state with move tracking
export interface ITurnState extends ITurnStateBase {
    readonly moves: IBasicMove[];
    readonly count: number; // Total moves count
}

// Game state interfaces
export interface IGameStateBase {
    board: IBoard;
    gameOver: boolean;
    winner: Player | null;
    currentPlayer: Player;
    isFirstTurn: boolean;
}

export interface IGameState extends IGameStateBase {
    currentTurn: ITurnState;
    scores: IScores;
}
