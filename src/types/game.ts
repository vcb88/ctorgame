import { IPosition, IGameMove, IGameState, IScores } from '@ctor-game/shared';

/**
 * Represents possible player values
 */
export enum Player {
    /** No player */
    None = 0,
    /** First player */
    First = 1,
    /** Second player */
    Second = 2
}

/**
 * Represents game status
 */
export enum GameStatus {
    /** Waiting for players */
    Waiting = 'waiting',
    /** Game in progress */
    Playing = 'playing',
    /** Game finished */
    Finished = 'finished'
}

/**
 * Extended move info for game history
 */
export interface GameMoveHistory extends IGameMove {
    /** Player who made the move */
    player: Player;
    /** Timestamp when move was made */
    timestamp: number;
}

/**
 * Represents validation result for a move
 */
export interface MoveValidation {
    /** Whether move is valid */
    isValid: boolean;
    /** Optional reason why move is invalid */
    reason?: string;
}

/**
 * Represents result of a capture operation
 */
export interface CaptureResult {
    /** Positions that were captured */
    positions: IPosition[];
    /** Player who made the capture */
    player: Player;
}

/**
 * Represents complete result of a move
 */
export interface MoveResult {
    /** Whether move was valid and applied */
    isValid: boolean;
    /** List of captures that occurred */
    captures: CaptureResult[];
    /** Player who moves next */
    nextPlayer: Player;
    /** Number of operations remaining in turn */
    opsRemaining: number;
    /** Whether game is over after this move */
    isGameOver: boolean;
    /** Winner if game is over */
    winner: Player | null;
}