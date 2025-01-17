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
    return [
        normalizeCoordinate(pos[0], size[0]),
        normalizeCoordinate(pos[1], size[1])
    ];
}

/**
 * Gets all adjacent positions considering board's toroidal nature
 */
export function getAdjacentPositions(pos: Position, size: Size): ReadonlyArray<Position> {
    return DIRECTIONS.map(([dy, dx]) => [
        normalizeCoordinate(pos[0] + dx, size[0]),
        normalizeCoordinate(pos[1] + dy, size[1])
    ]);
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
    if (y < 0 || y >= size[1] || x < 0 || x >= size[0]) {
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
    if (y < 0 || y >= size[1] || x < 0 || x >= size[0]) {
        throw new Error(`Invalid coordinates: x=${x}, y=${y}`);
    }
    board[y][x] = value;
}

/**
 * Creates a new board with given dimensions
 */
export function createBoard<T>(size: Size, defaultValue: T | null = null): T[][] {
    return Array(size[1]).fill(null)
        .map(() => Array(size[0]).fill(defaultValue));
}

/**
 * Checks if position is within board bounds
 */
export function isValidPosition(pos: Position, size: Size): boolean {
    return pos[0] >= 0 && pos[0] < size[0] && pos[1] >= 0 && pos[1] < size[1];
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
    row: pos[1],
    col: pos[0]
});

export const rowColToPosition = (row: number, col: number): Position => [col, row];