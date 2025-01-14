import type { IGameMove } from '../game/types.js';
import type { GameMetadata, GameDetails } from './metadata.js';

/**
 * Complete game history record including metadata, moves and additional details
 */
export interface IGameHistory {
    /** Game metadata from database */
    readonly metadata: GameMetadata;
    /** List of all game moves in chronological order */
    readonly moves: readonly IGameMove[];
    /** Additional game details and statistics */
    readonly details: GameDetails;
}

/**
 * Game history summary for listing purposes
 */
export interface IGameHistorySummary {
    /** Unique game identifier */
    readonly gameId: string;
    /** Game start timestamp */
    readonly startTime: string;
    /** Game end timestamp if game is finished */
    readonly endTime?: string;
    /** Array of player identifiers */
    readonly players: readonly string[];
    /** Identifier of the winning player if game is finished */
    readonly winner?: string;
    /** Total number of moves made in the game */
    readonly totalMoves: number;
    /** Game current status */
    readonly status: 'waiting' | 'playing' | 'finished' | 'expired';
}