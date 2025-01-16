import type { GameStatus, PlayerNumber, Position, GameMove, GameState, ValidationResult } from './core.js';

export type Numeric = {
    value: number;
};

export type Valid = {
    valid: boolean;
};

export type Message = {
    message: string;
};

export type Error = {
    error: string;
};

// Re-export core types
export type {
    GameStatus,
    PlayerNumber,
    Position,
    GameMove,
    GameState,
    ValidationResult,
};