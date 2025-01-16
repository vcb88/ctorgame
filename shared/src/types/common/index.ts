import type { 
    Position,
    Size,
    PlayerNumber,
    Timestamp,
    GameStatus,
    GamePhase,
    MoveType,
    ValidationResult
} from '../core.js';

export type Identifiable = {
    id: string;
};

export type TimeRange = {
    start: Timestamp;
    end: Timestamp;
};

export type BoardPosition = Position;
export type BoardCell = PlayerNumber | null;

// Re-export core types
export type {
    Position,
    Size,
    PlayerNumber,
    Timestamp,
    GameStatus,
    GamePhase,
    MoveType,
    ValidationResult
};