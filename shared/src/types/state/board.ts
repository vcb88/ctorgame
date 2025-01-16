/**
 * Board state types
 */

import type { Position, Size } from '../core/primitives.js';
import type { PlayerNumber } from '../game/types.js';
import { CellStateEnum } from './enums.js';

/** Board cell interface */
export interface BoardCell {
    readonly position: Position;
    readonly value: CellStateEnum;
    readonly lastModified?: number;
    readonly placedBy?: PlayerNumber;
}

/** Board row interface */
export interface BoardRow {
    readonly cells: ReadonlyArray<BoardCell>;
    readonly y: number;
}

/** Game board interface */
export interface Board {
    readonly size: Size;
    readonly rows: ReadonlyArray<BoardRow>;
    readonly lastModified: number;
    readonly version: string;
}

/** Board region for move validation */
export interface BoardRegion {
    readonly position: Position;
    readonly size: Size;
    readonly cells: ReadonlyArray<BoardCell>;
}

/** Board statistics */
export interface BoardStats {
    readonly emptyCells: number;
    readonly player1Cells: number;
    readonly player2Cells: number;
    readonly totalMoves: number;
    readonly lastMove?: Position;
}

/** Board validation result */
export interface BoardValidation {
    readonly valid: boolean;
    readonly errors: string[];
    readonly warnings: string[];
}