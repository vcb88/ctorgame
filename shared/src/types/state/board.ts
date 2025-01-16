/**
 * Board state types
 */

import type { Position, Size } from '../core/primitives.js';
import type { PlayerNumber } from '../game/types.js';
import { CellStateEnum } from './enums.js';

/** Board cell interface */
export interface BoardCell {
    position: Position;
    value: CellStateEnum;
    lastModified?: number;
    placedBy?: PlayerNumber;
}

/** Board row interface */
export interface BoardRow {
    cells: Array<BoardCell>;
    y: number;
}

/** Game board interface */
export interface Board {
    size: Size;
    rows: Array<BoardRow>;
    lastModified: number;
    version: string;
}

/** Board region for move validation */
export interface BoardRegion {
    position: Position;
    size: Size;
    cells: Array<BoardCell>;
}

/** Board statistics */
export interface BoardStats {
    emptyCells: number;
    player1Cells: number;
    player2Cells: number;
    totalMoves: number;
    lastMove?: Position;
}

/** Board validation result */
export interface BoardValidation {
    valid: boolean;
    errors: string[];
    warnings: string[];
}