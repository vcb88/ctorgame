/**
 * Re-export all base types
 */
export * from './base/primitives.js';

/**
 * Legacy type aliases for backward compatibility
 * @deprecated Use types from base/primitives.js directly
 */
export type {
    Position,
    Timestamp,
    PlayerNumber,
    GamePhase,
    GameStatus,
    MoveType,
    ConnectionStatus,
    ValidationResult,
} from './core.js';