import {
    ICell,
    IOperationCount
} from '../core';
import { Player } from '../base/enums';
import { IBoardSize } from '../base/primitives';
import { IBasicMove } from './moves';

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
// Basic turn state without operation count
export interface ITurnStateBase {
    placeOperationsLeft: number;
    replaceOperationsLeft: number;
}

// Turn state with move tracking
export interface ITurnState extends ITurnStateBase, IOperationCount {
    moves: IBasicMove[];
    count: number; // Required by IOperationCount - represents total moves count
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