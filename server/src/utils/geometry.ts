import type { IPosition, ISize } from '../types/shared.js';

/**
 * Gets all adjacent positions for a given position on a toroidal board
 * @param position Central position
 * @param size Board size
 * @returns Array of adjacent positions
 */
export function getAdjacentPositions(position: IPosition, size: ISize): IPosition[] {
    const { x, y } = position;
    const { width, height } = size;
    
    // All possible relative coordinates of adjacent cells
    const deltas = [
        [-1, -1], [0, -1], [1, -1],
        [-1,  0],          [1,  0],
        [-1,  1], [0,  1], [1,  1]
    ];
    
    return deltas.map(([dx, dy]) => ({
        x: (x + dx + width) % width,
        y: (y + dy + height) % height
    }));
}