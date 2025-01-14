/**
 * Base geometry types for game board and positions
 */

// Simple types without inheritance
export interface IPosition {
    readonly x: number;
    readonly y: number;
}

export interface ISize {
    readonly width: number;
    readonly height: number;
}

// Compound types using composition instead of inheritance
export interface IBoardPosition {
    readonly position: IPosition;
    readonly valid: boolean; // Indicates if position is within board bounds
}

export interface IBoardCell {
    readonly position: IPosition;
    readonly value: number | null;
}

// Type guards
export const isValidPosition = (pos: IPosition, size: ISize): boolean => {
    return pos.x >= 0 && pos.x < size.width && pos.y >= 0 && pos.y < size.height;
};