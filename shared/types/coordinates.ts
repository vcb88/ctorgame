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
 * Represents the game board state
 */
export interface IBoard {
    /** Board cells array where 0 represents empty cell, 
     * 1 represents first player's piece, 
     * 2 represents second player's piece */
    cells: number[][];
    /** Board dimensions */
    size: IBoardSize;
}

/**
 * Converts IPosition to row/column format
 * @param pos Position in x/y coordinates
 * @returns Position in row/column format
 */
export function positionToRowCol(pos: IPosition): { row: number; col: number } {
    return { row: pos.y, col: pos.x };
}

/**
 * Converts row/column coordinates to IPosition
 * @param row Row number
 * @param col Column number
 * @returns Position in x/y coordinates
 */
export function rowColToPosition(row: number, col: number): IPosition {
    return { x: col, y: row };
}

/**
 * Normalizes position for toroidal board
 * @param pos Position to normalize
 * @param size Board size
 * @returns Normalized position within board bounds
 */
export function normalizePosition(pos: IPosition, size: IBoardSize): IPosition {
    return {
        x: ((pos.x % size.width) + size.width) % size.width,
        y: ((pos.y % size.height) + size.height) % size.height
    };
}