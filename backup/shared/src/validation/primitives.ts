import type { IPosition } from '../types/base/primitives.js';
import { BOARD_SIZE } from '../types/base/constants.js';

export function validatePosition(position: IPosition): boolean {
    const { x, y } = position;
    return (
        Number.isInteger(x) &&
        Number.isInteger(y) &&
        x >= 0 &&
        x < BOARD_SIZE &&
        y >= 0 &&
        y < BOARD_SIZE
    );
}