/**
 * Player identifiers in the game
 */
export enum Player {
    /** Empty cell or no player */
    None = 0,
    /** First player */
    First = 1,
    /** Second player */
    Second = 2
}

/**
 * Game phase states
 */
export enum GamePhase {
    /** Initial state before game starts */
    INITIAL = 'INITIAL',
    /** Connecting to game */
    CONNECTING = 'CONNECTING',
    /** Waiting for other player */
    WAITING = 'WAITING',
    /** Game in progress */
    PLAYING = 'PLAYING',
    /** Game over */
    GAME_OVER = 'GAME_OVER',
    /** Error state */
    ERROR = 'ERROR'
}

/**
 * Possible game outcomes
 */
export enum GameOutcome {
    /** Player won the game */
    Win = 'WIN',
    /** Player lost the game */
    Loss = 'LOSS',
    /** Game ended in a draw */
    Draw = 'DRAW'
}

/**
 * Represents a position on the game board
 */
export interface IPosition {
    /** X coordinate (column) */
    x: number;
    /** Y coordinate (row) */
    y: number;
}

/**
 * Represents the size of the game board
 */
export interface IBoardSize {
    /** Board width in cells */
    width: number;
    /** Board height in cells */
    height: number;
}

/**
 * Represents the game board state.
 * The board is accessed using [y][x] coordinates, where:
 * - y represents the row (vertical position, 0 at top)
 * - x represents the column (horizontal position, 0 at left)
 * Example: cells[1][2] accesses the cell in the second row, third column
 */
export interface IBoard {
    /** 
     * Board cells array using [y][x] coordinates.
     * Values represent:
     * - null or 0: Empty cell (Player.None)
     * - 1: First player's piece (Player.First)
     * - 2: Second player's piece (Player.Second)
     */
    cells: (number | null)[][];
    /** Board dimensions */
    size: IBoardSize;
}

/**
 * Game configuration constants
 */
export const BOARD_SIZE = 10;
export const MIN_ADJACENT_FOR_REPLACE = 5;
export const MAX_PLACE_OPERATIONS = 2;