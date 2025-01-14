/**
 * MongoDB specific types
 */

import type {
    IGameState,
    IGameMove,
    IPlayer,
    GameStatus,
    IScores,
    PlayerNumber,
    UUID,
    ISize
} from '../core/base.js';

/**
 * Game metadata stored in MongoDB
 */
export interface IGameMetadata {
    // Game identification
    readonly gameId: UUID;
    readonly code: string;

    // Game status
    readonly status: GameStatus;
    readonly startTime: string;
    readonly endTime?: string;
    readonly lastActivityAt: string;
    readonly expiresAt: string;

    // Players
    readonly players: {
        readonly first: UUID;
        readonly second?: UUID;
    };

    // Game state
    readonly totalTurns: number;
    readonly boardSize: ISize;
    readonly currentState: IGameState;
    readonly currentPlayer?: PlayerNumber;

    // Game results
    readonly winner?: PlayerNumber;
    readonly finalScore?: IScores;
    readonly duration?: number; // in seconds
}

/**
 * Update data for game metadata
 */
export interface IGameMetadataUpdate {
    currentState?: IGameState;
    lastActivityAt: string;
    status: GameStatus;
    totalTurns: number;
    currentPlayer?: PlayerNumber;
    endTime?: string;
    winner?: PlayerNumber;
    finalScore?: IScores;
    duration?: number;
}

/**
 * Game history record
 */
export interface IGameHistoryRecord {
    readonly timestamp: string;
    readonly gameId: UUID;
    readonly playerNumber: PlayerNumber;
    readonly move: IGameMove;
    readonly resultingState: IGameState;
}