import {
    ICell,
    ICollection,
    IOperationCount,
    ITimestamp
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
export interface ITurnStateBase extends IOperationCount {
    placeOperationsLeft: number;
    replaceOperationsLeft: number;
    count?: number; // Required by IOperationCount
    items?: IBasicMove[]; // Required by ICollection
}

export interface ITurnState extends ITurnStateBase {
    moves: IBasicMove[];
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