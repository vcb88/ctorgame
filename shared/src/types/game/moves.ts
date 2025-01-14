import type { IPosition } from '../geometry/types.js';
import type { 
    MoveType,
    IGameMove,
    IGameMoveComplete,
    PlayerNumber 
} from './types.js';

/**
 * Server-side move with replacement information
 */
export interface IServerMove extends IGameMove {
    readonly replacements?: ReadonlyArray<[number, number]>;
}

/**
 * Replacement validation result
 */
export interface IReplaceValidation {
    readonly valid: boolean;
    readonly replacements?: ReadonlyArray<[number, number]>;
    readonly error?: string;
}

// Re-export type guards and move types
export { 
    isGameMove,
    isGameMoveComplete,
    isMoveType
} from './types.js';