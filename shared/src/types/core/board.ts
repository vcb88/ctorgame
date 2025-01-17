/**
 * Simplified board types and utilities
 */

import { CellValue, Size, Position } from '../base/primitives.js';

export type { Position as BoardPosition, CellValue };

/** Game board as 2D array */
export type Board = CellValue[][];

/** Board utility functions */
export function createBoard(size: Size): Board {
    return Array(size[1]).fill(null)
        .map(() => Array(size[0]).fill(0));
}

export function isValidPosition(pos: Position, size: Size): boolean {
    return pos[0] >= 0 && pos[0] < size[0] && 
           pos[1] >= 0 && pos[1] < size[1];
}

export function getCellValue(board: Board, pos: Position): CellValue {
    return board[pos[1]][pos[0]];
}