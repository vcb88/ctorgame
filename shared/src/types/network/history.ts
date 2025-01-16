import type { ErrorResponse } from './errors.js';

/**
 * Client requests for game history
 */
export interface IHistoryClientEvents {
    /** Request list of all saved games */
    GET_SAVED_GAMES: () => void;
}

/**
 * Server responses for game history
 */
export interface IHistoryServerEvents {
    /** List of saved games */
    SAVED_GAMES: (data: { games: IGameHistoryEntry[] }) => void;
    /** Error response */
    ERROR: (error: ErrorResponse) => void;
}

/**
 * Basic game summary for listing in history
 */
export interface IGameHistoryEntry {
    gameCode: string;
    startTime: string;
    endTime?: string;
    players: Array<string>;
    winner?: string;
    totalMoves: number;
}