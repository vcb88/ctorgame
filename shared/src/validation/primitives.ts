/**
 * Basic validation functions for primitive types
 */

import type { Position, Size } from '../types/base/types.js';

type ValidatedPosition = {
    position: Position;
    valid: boolean;
};

/**
 * Validates if a position is within board boundaries
 */
export function validatePosition(position: Position, size: Size): boolean {
    return (
        Number.isInteger(position[0]) &&
        Number.isInteger(position[1]) &&
        position[0] >= 0 &&
        position[0] < size[0] &&
        position[1] >= 0 &&
        position[1] < size[1]
    );
}

/**
 * Creates a validated board position
 * Returns IBoardPosition with valid flag indicating if position is within bounds
 */
export function createBoardPosition(position: Position, size: Size): ValidatedPosition {
    return {
        position,
        valid: validatePosition(position, size)
    };
}

/**
 * Validates size parameters
 */
export function validateSize(size: Size): boolean {
    return (
        Number.isInteger(size[0]) &&
        Number.isInteger(size[1]) &&
        size[0] > 0 &&
        size[1] > 0
    );
}

/**
 * Type guards
 */
export function isPosition(value: unknown): value is Position {
    if (!value || !Array.isArray(value) || value.length !== 2) return false;
    return (
        typeof value[0] === 'number' &&
        typeof value[1] === 'number' &&
        Number.isInteger(value[0]) &&
        Number.isInteger(value[1])
    );
}

export function isSize(value: unknown): value is Size {
    if (!value || !Array.isArray(value) || value.length !== 2) return false;
    return (
        typeof value[0] === 'number' &&
        typeof value[1] === 'number' &&
        Number.isInteger(value[0]) &&
        Number.isInteger(value[1])
    );
}

export function isBoardPosition(value: unknown): value is ValidatedPosition {
    if (!value || typeof value !== 'object') return false;
    const bp = value as Record<string, unknown>;
    return (
        typeof bp.valid === 'boolean' &&
        isPosition(bp.position)
    );
}