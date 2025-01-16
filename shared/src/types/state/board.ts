/**
 * Board state types
 */

import type { Position, Size, PlayerNumber, Timestamp, ValidationResult, Version } from '../base/primitives.js';
import { CellStateEnum } from './enums.js';

/** Board cell interface */
export interface BoardCell {
    position: Position;
    value: CellStateEnum;
    lastModified?: Timestamp;
    placedBy?: PlayerNumber;
}

/** Board row */
export type BoardRow = {
    cells: BoardCell[];
    y: number;
};

/** Game board */
export type Board = {
    size: Size;
    rows: BoardRow[];
    lastModified: Timestamp;
    version: Version;
};

/** Board region for move validation */
export type BoardRegion = {
    position: Position;
    size: Size;
    cells: BoardCell[];
};

/** Board statistics */
export type BoardStats = {
    emptyCells: number;
    player1Cells: number;
    player2Cells: number;
    totalMoves: number;
    lastMove?: Position;
};

/** Board validation result */
export interface BoardValidation extends ValidationResult {
    errors: string[];
    warnings: string[];
}