import type { Position, Size } from '../types/core.js';

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
 */
function normalizeCoordinate(value: number, size: number): number {
    return ((value % size) + size) % size;
}

/**
 * Normalizes position for toroidal board
 */
export function normalizePosition(pos: Position, size: Size): Position {
    return {
        x: normalizeCoordinate(pos.x, size.width),
        y: normalizeCoordinate(pos.y, size.height)
    };
}

/**
 * Gets all adjacent positions considering board's toroidal nature
 */
export function getAdjacentPositions(pos: Position, size: Size): ReadonlyArray<Position> {
    return DIRECTIONS.map(([dy, dx]) => ({
        x: normalizeCoordinate(pos.x + dx, size.width),
        y: normalizeCoordinate(pos.y + dy, size.height)
    }));
}

/**
 * Gets a cell value from the board with validation
 * @throws Error if coordinates are out of bounds
 */
export function getBoardCell<T>(
    board: ReadonlyArray<ReadonlyArray<T>>,
    size: Size,
    x: number,
    y: number
): T | null {
    if (y < 0 || y >= size.height || x < 0 || x >= size.width) {
        throw new Error(`Invalid coordinates: x=${x}, y=${y}`);
    }
    return board[y][x];
}

/**
 * Sets a cell value on the board with validation
 * @throws Error if coordinates are out of bounds
 */
export function setBoardCell<T>(
    board: T[][],
    size: Size,
    x: number,
    y: number,
    value: T
): void {
    if (y < 0 || y >= size.height || x < 0 || x >= size.width) {
        throw new Error(`Invalid coordinates: x=${x}, y=${y}`);
    }
    board[y][x] = value;
}

/**
 * Creates a new board with given dimensions
 */
export function createBoard<T>(size: Size, defaultValue: T | null = null): T[][] {
    return Array(size.height).fill(null)
        .map(() => Array(size.width).fill(defaultValue));
}

/**
 * Checks if position is within board bounds
 */
export function isValidPosition(pos: Position, size: Size): boolean {
    return pos.x >= 0 && pos.x < size.width && pos.y >= 0 && pos.y < size.height;
}

/**
 * Creates a deep copy of a board
 */
export function cloneBoard<T>(board: ReadonlyArray<ReadonlyArray<T>>): T[][] {
    return board.map(row => [...row]);
}

/**
 * Position conversion utilities
 */
export const positionToRowCol = (pos: Position): { row: number; col: number } => ({
    row: pos.y,
    col: pos.x
});

export const rowColToPosition = (row: number, col: number): Position => ({
    x: col,
    y: row
});