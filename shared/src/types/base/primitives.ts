/**
 * Core primitive types for the entire application
 * This is the single source of truth for basic types
 */

// Basic types
export type Size = [number, number];
export type Position = [number, number];
export type UUID = string;
export type Timestamp = number;
export type Version = string;

// Game-specific types
export type CellValue = 0 | 1 | 2;  // 0 = empty, 1 = player1, 2 = player2
export type PlayerNumber = 1 | 2;
export type Scores = [number, number];  // [player1Score, player2Score]

// Status types
export type GameStatus = 'waiting' | 'active' | 'finished';
export type GamePhase = 'setup' | 'play' | 'end';
export type ConnectionStatus = 'connected' | 'disconnected' | 'error';

// Operation types
export type MoveType = 'place' | 'replace' | 'skip';
export type OperationType = MoveType;

// Common types
export type ValidationResult = {
    valid: boolean;
    message?: string;
};

export type Collection<T> = Array<T>;

export type WithMetadata<T> = {
    data: T;
    timestamp: Timestamp;
    version?: Version;
};