/**
 * Core types exports
 */

export * from './enums.js';
export * from './primitives.js';
export * from './types.js';

// Legacy exports for backward compatibility
import type { 
    PlayerNumber,
    Position,
    Size,
    Timestamp,
    ValidationResult,
    CellValue
} from './primitives.js';
import type {
    Player,
    GameMove,
    GameState,
    GameError
} from './types.js';
import {
    GamePhaseEnum as Phase,
    GameStatusEnum as Status,
    MoveTypeEnum as MoveType,
    ConnectionStatusEnum as ConnectionStatus
} from './enums.js';

// Exposing legacy types 
export type {
    PlayerNumber as IPlayerNumber,
    Position as IPosition,
    Size as ISize,
    Timestamp as ITimestamp,
    ValidationResult as IValidationResult,
    CellValue as ICellValue,
    Player as IPlayer,
    GameMove as IGameMove,
    GameState as IGameState,
    GameError as IGameError
};

// Exposing legacy enums
export type { 
    Phase as IPhase,
    Status as IGameStatus,
    MoveType as IMoveType,
    ConnectionStatus as IConnectionStatus
};