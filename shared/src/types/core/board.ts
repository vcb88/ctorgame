/**
 * Simplified board types and utilities
 */

/** Basic cell values */
export type CellValue = 0 | 1 | 2;  // 0 - empty, 1 - player 1, 2 - player 2

/** Game board as 2D array */
export type Board = CellValue[][];

/** Board dimensions */
export interface BoardSize {
    width: number;
    height: number;
}

/** Cell position */
export interface BoardPosition {
    x: number;
    y: number;
}

/** Board utility functions */
export function createBoard(size: BoardSize): Board {
    return Array(size.height).fill(null)
        .map(() => Array(size.width).fill(0));
}

export function isValidPosition(pos: BoardPosition, size: BoardSize): boolean {
    return pos.x >= 0 && pos.x < size.width && 
           pos.y >= 0 && pos.y < size.height;
}

export function getCellValue(board: Board, pos: BoardPosition): CellValue {
    return board[pos.y][pos.x];
}