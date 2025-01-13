// Types needed for validation
import { IPosition, IBoardSize, Player } from './basic-types';
import { GameMove } from './moves';
import { IGameState } from './state';

// Define validation-specific types
export interface IValidationResult {
    isValid: boolean;
    errors?: string[];
}

// Re-export only types needed for validation functionality
export type {
    IPosition,
    IBoardSize,
    GameMove,
    IGameState
}
export { Player };