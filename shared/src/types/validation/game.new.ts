import type { IPosition, IBoardSize } from '../geometry/types.js';
import type { PlayerNumber } from '../game/players.js';
import type { IGameMoveComplete } from '../game/moves.js';
import type { IGameState } from '../game/state.js';

/**
 * Base validation result interface
 */
interface IValidationResult {
    readonly valid: boolean;
    readonly error?: string;
}

/**
 * Game move validation result
 */
export interface IGameMoveValidation extends IValidationResult {
    readonly move: IGameMoveComplete;
}

/**
 * Board position validation result
 */
export interface IBoardValidation extends IValidationResult {
    readonly position: IPosition;
    readonly size: IBoardSize;
}

/**
 * Game state validation result
 */
export interface IStateValidation extends IValidationResult {
    readonly state: IGameState;
    readonly player: PlayerNumber;
}

/**
 * Type guard for validation result
 */
export function isValidationResult(value: unknown): value is IValidationResult {
    if (!value || typeof value !== 'object') return false;
    const result = value as IValidationResult;
    return (
        typeof result.valid === 'boolean' &&
        (result.error === undefined || typeof result.error === 'string')
    );
}

// Re-export types needed for validation
export type {
    IPosition,
    IBoardSize,
    IGameMoveComplete,
    IGameState,
    PlayerNumber
}