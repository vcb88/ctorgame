import type { IGameMove } from '../game/types.js';
import type { GameMetadata, GameDetails } from './metadata.js';

/**
 * Complete game history record including metadata, moves and additional details
 */
export interface IGameHistory {
    /** Game metadata from database */
    metadata: GameMetadata;
    /** List of all game moves in chronological order */
    moves: Array<IGameMove>;
    /** Additional game details and statistics */
    details: GameDetails;
}

/**
 * Game history summary for listing purposes
 */
export interface IGameHistorySummary {
    /** Unique game identifier */
    gameId: string;
    /** Game start timestamp */
    startTime: string;
    /** Game end timestamp if game is finished */
    endTime?: string;
    /** Array of player identifiers */
    players: Array<string>;
    /** Identifier of the winning player if game is finished */
    winner?: string;
    /** Total number of moves made in the game */
    totalMoves: number;
    /** Game current status */
    status: 'waiting' | 'playing' | 'finished' | 'expired';
}