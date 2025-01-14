/**
 * Basic validation functions for primitive types
 */

import type { IPosition, ISize, IBoardPosition } from '../types/geometry/types.js';

/**
 * Validates if a position is within board boundaries
 */
export function validatePosition(position: IPosition, size: ISize): boolean {
    return (
        Number.isInteger(position.x) &&
        Number.isInteger(position.y) &&
        position.x >= 0 &&
        position.x < size.width &&
        position.y >= 0 &&
        position.y < size.height
    );
}

/**
 * Creates a validated board position
 * Returns IBoardPosition with valid flag indicating if position is within bounds
 */
export function createBoardPosition(position: IPosition, size: ISize): IBoardPosition {
    return {
        position,
        valid: validatePosition(position, size)
    };
}

/**
 * Validates size parameters
 */
export function validateSize(size: ISize): boolean {
    return (
        Number.isInteger(size.width) &&
        Number.isInteger(size.height) &&
        size.width > 0 &&
        size.height > 0
    );
}

/**
 * Type guards
 */
export function isPosition(value: unknown): value is IPosition {
    if (!value || typeof value !== 'object') return false;
    const pos = value as Record<string, unknown>;
    return (
        typeof pos.x === 'number' &&
        typeof pos.y === 'number' &&
        Number.isInteger(pos.x) &&
        Number.isInteger(pos.y)
    );
}

export function isSize(value: unknown): value is ISize {
    if (!value || typeof value !== 'object') return false;
    const size = value as Record<string, unknown>;
    return (
        typeof size.width === 'number' &&
        typeof size.height === 'number' &&
        Number.isInteger(size.width) &&
        Number.isInteger(size.height)
    );
}

export function isBoardPosition(value: unknown): value is IBoardPosition {
    if (!value || typeof value !== 'object') return false;
    const bp = value as Record<string, unknown>;
    return (
        typeof bp.valid === 'boolean' &&
        isPosition(bp.position)
    );
}