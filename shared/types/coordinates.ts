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