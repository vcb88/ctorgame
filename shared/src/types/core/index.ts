/**
 * Core types exports
 */

// New simplified types
export * from './board.js';
export * from './errors.js';
export * from './moves.js';

// Basic types still used from primitives
export type {
    UUID,
    Timestamp,
    Version
} from './primitives.js';

// Basic enums still used
export {
    GameStatusEnum,
    ConnectionStatusEnum
} from './enums.js';

// Legacy type support
import type { Board, BoardPosition, CellValue } from './board.js';
import type { GameError } from './errors.js';
import type { GameMove, TurnState } from './moves.js';

export type {
    // Board types
    Board as IBoard,
    BoardPosition as IPosition,
    CellValue as ICellValue,
    
    // Error types
    GameError as IError,
    
    // Move types
    GameMove as IMove,
    TurnState as ITurnState
};