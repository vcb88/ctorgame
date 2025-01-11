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
 * Gets a cell value from the board with validation
 * @throws Error if coordinates are out of bounds
 */
export function getBoardCell(board: IBoard, x: number, y: number): number {
    if (y < 0 || y >= board.size.height || x < 0 || x >= board.size.width) {
        throw new Error(`Invalid coordinates: x=${x}, y=${y}`);
    }
    return board.cells[y][x] ?? 0; // Return 0 (Player.None) for null values
}

/**
 * Sets a cell value on the board with validation
 * @throws Error if coordinates are out of bounds
 */
export function setBoardCell(board: IBoard, x: number, y: number, value: number): void {
    if (y < 0 || y >= board.size.height || x < 0 || x >= board.size.width) {
        throw new Error(`Invalid coordinates: x=${x}, y=${y}`);
    }
    board.cells[y][x] = value;
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
 * Direction vectors for adjacent cells.
 * Each vector is [dy, dx] representing vertical and horizontal offsets.
 */
export const DIRECTIONS = [
    [-1, -1], [-1, 0], [-1, 1],  // Top row
    [0, -1],           [0, 1],   // Middle row (excluding center)
    [1, -1],  [1, 0],  [1, 1]    // Bottom row
] as const;

/**
 * Normalizes a coordinate to fit within board dimensions (toroidal wrapping)
 * @param value The coordinate value to normalize
 * @param size The board dimension size
 * @returns Normalized coordinate value
 */
function normalizeCoordinate(value: number, size: number): number {
    return ((value % size) + size) % size;
}

/**
 * Normalizes position for toroidal board
 * @param pos Position to normalize
 * @param size Board size
 * @returns Normalized position within board bounds
 */
export function normalizePosition(pos: IPosition, size: IBoardSize): IPosition {
    return {
        x: normalizeCoordinate(pos.x, size.width),
        y: normalizeCoordinate(pos.y, size.height)
    };
}

/**
 * Gets all adjacent positions considering board's toroidal nature.
 * Uses [dy, dx] direction vectors to maintain consistency with [y][x] board access.
 * @param pos Center position (x, y coordinates)
 * @param board Game board
 * @returns Array of adjacent positions in clockwise order
 */
export function getAdjacentPositions(pos: IPosition, board: IBoard): IPosition[] {
    return DIRECTIONS.map(([dy, dx]) => ({
        x: normalizeCoordinate(pos.x + dx, board.size.width),
        y: normalizeCoordinate(pos.y + dy, board.size.height)
    }));
}