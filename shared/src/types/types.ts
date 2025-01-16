/**
 * Re-export all base types
 */
export * from './base/primitives.js';

/**
 * Legacy type aliases for backward compatibility
 * @deprecated Use types from base/primitives.js directly
 */
export type {
    Position as IPosition,
    Timestamp as ITimestamp,
    PlayerNumber as IPlayerNumber,
    GamePhase as IPhase,
    GameStatus as IGameStatus,
    MoveType as IOperationType,
    ConnectionStatus as IConnectionStatus,
    ValidationResult as IValidationResult,
} from './base/primitives.js';