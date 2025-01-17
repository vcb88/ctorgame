import type { Position } from '@ctor-game/shared/dist/types/core.js';
import { BOARD_SIZE } from '../config/constants.js';

/**
 * Gets all adjacent positions for a given position on a toroidal board
 * @param position Central position
 * @returns Array of adjacent positions
 */
export function getAdjacentPositions(position: Position): Position[] {
    const [x, y] = position;
    
    // All possible relative coordinates of adjacent cells
    const deltas = [
        [-1, -1], [0, -1], [1, -1],
        [-1,  0],          [1,  0],
        [-1,  1], [0,  1], [1,  1]
    ];
    
    return deltas.map(([dx, dy]) => [
        (x + dx + BOARD_SIZE) % BOARD_SIZE,
        (y + dy + BOARD_SIZE) % BOARD_SIZE
    ]);
}