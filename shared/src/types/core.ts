/**
 * Core types for the MVP version
 * Single source of truth for all shared type definitions
 */

/** Basic primitive types */
export type Position = [number, number];
export type Size = [number, number];
export type PlayerNumber = 1 | 2;
export type Scores = [number, number];
export type Timestamp = number;
export type UUID = string;

/** Game status and phases */
export type GameStatus = 'waiting' | 'active' | 'finished';
export type GamePhase = 'setup' | 'play' | 'end';
export type ConnectionStatus = 'connected' | 'disconnected' | 'error';

/** Move related types */
export type MoveType = 'place' | 'replace' | 'skip';
export type CellValue = PlayerNumber | null;

export type GameMove = {
    type: MoveType;
    pos?: Position;
};

/** Player and game state */
export type Player = {
    id: string;
    num: PlayerNumber;
    connected: boolean;
};

export type GameState = {
    id: UUID;
    board: CellValue[][];
    size: Size;
    scores: Scores;
    currentPlayer: PlayerNumber;
    status: GameStatus;
    winner?: PlayerNumber;
    lastMove?: GameMove;
    timestamp: number;
};

/** Error handling */
export type GameError = {
    code: string;
    message: string;
    details?: Record<string, unknown>;
};

export type ValidationResult = {
    valid: boolean;
    message?: string;
};

/** Generic collection type */
export type Collection<T> = T[];

/** Generic type for data with metadata */
export type WithMetadata<T> = {
    data: T;
    timestamp: Timestamp;
    version?: string;
};