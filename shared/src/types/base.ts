import { GameStage, MoveType, GameError as CoreGameError } from './core.js';

// Game outcomes
export type GameOutcome = 'WIN' | 'LOSS' | 'DRAW' | 'FORFEIT' | 'TIMEOUT';

// Recovery strategies
export type RecoveryStrategy = 'RETRY' | 'ROLLBACK' | 'IGNORE' | 'ABORT';

// Operation types
export type OperationType = 'place' | 'replace' | 'end_turn';

// Error codes
export type ErrorCode = 
    // Connection errors
    | 'CONNECTION_ERROR'
    | 'CONNECTION_TIMEOUT'
    | 'CONNECTION_LOST'
    // Operation errors
    | 'OPERATION_FAILED'
    | 'OPERATION_TIMEOUT'
    | 'OPERATION_CANCELLED'
    // Game errors
    | 'INVALID_MOVE'
    | 'INVALID_STATE'
    | 'GAME_NOT_FOUND'
    | 'GAME_FULL'
    // State errors
    | 'STATE_VALIDATION_ERROR'
    | 'STATE_TRANSITION_ERROR'
    // Storage errors
    | 'STORAGE_ERROR'
    // Unknown error
    | 'UNKNOWN_ERROR';

export type ErrorSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type GameError = CoreGameError & {
    severity: ErrorSeverity;
    recoverable?: boolean;
    retryCount?: number;
};

export type ConnectionState = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING' | 'ERROR';
