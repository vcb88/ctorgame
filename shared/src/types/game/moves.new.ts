import type { ITimestamp } from '../core/primitives.js';
import type { IPosition } from '../geometry/types.js';
import type { PlayerNumber } from './players.js';

/**
 * Available move operation types
 */
export type MoveType = 'place' | 'replace' | 'end_turn';

/**
 * Base move interface with operation type
 */
export interface IMoveBase {
    readonly type: MoveType;
}

/**
 * Move with position information
 */
export interface IPositionedMove extends IMoveBase {
    readonly position: IPosition;
}

/**
 * Basic move interface
 */
export interface IGameMove extends IPositionedMove {}

/**
 * Server-side move with replacement information
 */
export interface IServerMove extends IGameMove {
    readonly replacements?: ReadonlyArray<[number, number]>;
}

/**
 * Complete game move with player and timestamp
 */
export interface IGameMoveComplete extends IServerMove {
    readonly player: PlayerNumber;
    readonly timestamp: number;
}

/**
 * Replacement validation result
 */
export interface IReplaceValidation {
    readonly valid: boolean;
    readonly replacements?: ReadonlyArray<[number, number]>;
    readonly error?: string;
}

/**
 * Type guard for basic move
 */
export function isGameMove(value: unknown): value is IGameMove {
    if (!value || typeof value !== 'object') return false;
    const move = value as IGameMove;
    return (
        typeof move.type === 'string' &&
        ['place', 'replace', 'end_turn'].includes(move.type) &&
        move.position &&
        typeof move.position.x === 'number' &&
        typeof move.position.y === 'number'
    );
}

/**
 * Type guard for complete game move
 */
export function isGameMoveComplete(value: unknown): value is IGameMoveComplete {
    if (!isGameMove(value)) return false;
    const move = value as IGameMoveComplete;
    return (
        typeof move.player === 'number' &&
        [1, 2].includes(move.player) &&
        typeof move.timestamp === 'number'
    );
}