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
    readonly placeOperationsLeft: number;
    readonly replaceOperationsLeft: number;
}

export interface ITurnState extends ITurnStateBase, ICollection<IBasicMove> {
    readonly moves: ReadonlyArray<IBasicMove>;
}

// Game state interfaces
export interface IGameStateBase {
    readonly board: IBoard;
    readonly gameOver: boolean;
    readonly winner: Player | null;
    readonly currentPlayer: Player;
    readonly isFirstTurn: boolean;
}

export interface IGameState extends IGameStateBase {
    readonly currentTurn: ITurnState;
    readonly scores: IScores;
}