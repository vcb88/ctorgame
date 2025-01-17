import type { CellValue } from '@ctor-game/shared/types/core.js';

// Extend Array to ensure all array methods are available
export interface Board extends Array<Array<CellValue>> {
    [index: number]: Array<CellValue>;
    length: number;
}