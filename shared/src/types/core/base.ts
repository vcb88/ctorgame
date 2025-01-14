/**
 * Core primitive types and interfaces
 * These are the foundational types used throughout the application
 * No dependencies on other types allowed in this file
 */

// Primitive type aliases
export type UUID = string;
export type Timestamp = number;
export type PlayerNumber = 1 | 2;  // Using literal types for better type safety

// Basic interfaces without inheritance
export interface IPosition {
    x: number;
    y: number;
}

export interface ISize {
    width: number;
    height: number;
}

export interface IIdentifiable {
    id: UUID;
}

export interface ITimestamped {
    timestamp: Timestamp;
}

export interface IVersioned {
    version: string;
}

// Validation related
export interface IValidationResult {
    valid: boolean;
    message?: string;
}

// Basic game types
export type GameStatus = 'waiting' | 'playing' | 'finished';
export type OperationType = 'place' | 'replace';

// Score tracking
export interface IScores {
    player1: number;
    player2: number;
}