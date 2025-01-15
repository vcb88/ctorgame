import type { IPosition, ISize } from '../geometry/types.js';
import type { 
    PlayerNumber,
    IGameState,
    IGameMoveComplete
} from '../game/types.js';

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
    readonly size: ISize;
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
    ISize as IBoardSize,
    IGameMoveComplete,
    IGameState,
    PlayerNumber
}