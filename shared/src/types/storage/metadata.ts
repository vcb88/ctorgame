/**
 * Simplified game metadata types
 */
import type { GameStatus, PlayerNumber, GameMove, Scores } from '../primitives.js';

// TODO: Move back to constants when module system is fixed
const BOARD_SIZE = 10;

/**
 * Basic game metadata
 */
export type GameMeta = {
    // Core info
    id: string;                 // Unique game identifier
    code: string;              // Short connection code (4 digits)
    status: GameStatus;        // Current game status
    
    // Players
    players: [string?, string?]; // [player1Id, player2Id]
    
    // Timestamps (unix timestamp in seconds)
    created: number;           // Creation time
    updated: number;           // Last activity time
    expires: number;           // Expiration time
    finished?: number;         // Completion time
};

/**
 * Game statistics
 * Only for finished games, optional for active games
 */
export type GameStats = {
    moves: number;             // Total number of moves
    duration: number;          // Game duration in seconds
    winner?: PlayerNumber;     // Winner (if game finished)
    scores?: Scores;          // Final scores [player1, player2]
};

/**
 * Move history entry with timing
 */
export type GameHistoryEntry = {
    move: GameMove;           // The move made
    time: number;            // Unix timestamp
};

/**
 * Complete game history
 */
export type GameHistory = GameMeta & {
    stats: GameStats;
    history: GameHistoryEntry[];
};

/**
 * Utility functions
 */

/** Create new game metadata */
export const createGameMeta = (id: string): GameMeta => ({
    id,
    code: generateGameCode(),
    status: 'waiting',
    players: [],
    created: Math.floor(Date.now() / 1000),
    updated: Math.floor(Date.now() / 1000),
    expires: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
});

/** Generate a random 4-digit game code */
const generateGameCode = (): string => 
    Math.floor(Math.random() * 10000).toString().padStart(4, '0');

/** Calculate game duration in seconds */
export const calculateGameDuration = (history: GameHistoryEntry[]): number => {
    if (history.length < 2) return 0;
    return history[history.length - 1].time - history[0].time;
};

/** Calculate current game statistics */
export const calculateGameStats = (history: GameHistoryEntry[]): GameStats => ({
    moves: history.length,
    duration: calculateGameDuration(history)
});