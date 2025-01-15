import type { GameStatus, PlayerNumber, IGameMove } from '../game/types.js';
import type { ISize } from '../geometry/types.js';

/**
 * Core game metadata without state information
 */
export interface GameMetadata {
    // Identification
    gameId: string;              // Unique game identifier
    code: string;                // Short connection code (4 digits)

    // Status
    status: GameStatus;          // Current game status
    startTime: string;           // ISO timestamp
    endTime?: string;            // ISO timestamp for finished games
    lastActivityAt: string;      // ISO timestamp of last action
    expiresAt: string;          // ISO timestamp when game expires

    // Players
    players: {
        first?: string;         // First player's ID
        second?: string;        // Second player's ID
    };

    // Game configuration
    boardSize: ISize;          // Board dimensions

    // Statistics
    totalTurns: number;         // Total number of turns played
    duration?: number;          // Game duration in seconds
    winner?: PlayerNumber;      // Winner (only for finished games)
    finalScore?: {             // Final score (only for finished games)
        player1: number;
        player2: number;
    };
}

/**
 * Detailed game statistics and analytics
 */
export interface GameDetails {
    moves: IGameMove[];         // Complete move history
    timing: {
        moveTimes: number[];    // Time taken for each move (ms)
        avgMoveTime: number;    // Average move time (ms)
    };
    territoryHistory: Array<{   // Territory control after each move
        player1: number;
        player2: number;
    }>;
}

/**
 * Combined game history record
 */
export interface GameHistory {
    metadata: GameMetadata;     // Game metadata
    moves: IGameMove[];         // Complete move history
    details: GameDetails;       // Game statistics
}