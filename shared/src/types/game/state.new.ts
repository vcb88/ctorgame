import type { IBoardSize } from '../geometry/types.js';
import type { PlayerNumber } from './players.js';
import type { IGameMove } from './moves.js';

/**
 * Base board interface defining size and cells
 */
export interface IBoardBase {
    readonly size: IBoardSize;
    readonly cells: ReadonlyArray<ReadonlyArray<number | null>>;
}

/**
 * Game board interface
 */
export interface IBoard extends IBoardBase {}

/**
 * Game scores interface
 */
export interface IGameScores {
    readonly player1: number;
    readonly player2: number;
}

/**
 * Basic turn state with operation counts
 */
export interface ITurnStateBase {
    readonly placeOperationsLeft: number;
    readonly replaceOperationsLeft: number;
}

/**
 * Turn state with move tracking
 */
export interface ITurnState extends ITurnStateBase {
    readonly moves: ReadonlyArray<IGameMove>;
    readonly count: number; // Total moves count
}

/**
 * Basic game state
 */
export interface IGameStateBase {
    readonly board: IBoard;
    readonly gameOver: boolean;
    readonly winner: PlayerNumber | null;
    readonly currentPlayer: PlayerNumber;
    readonly isFirstTurn: boolean;
}

/**
 * Complete game state
 */
export interface IGameState extends IGameStateBase {
    readonly currentTurn: ITurnState;
    readonly scores: IGameScores;
    readonly turnNumber: number; // Global turn counter for the game
}