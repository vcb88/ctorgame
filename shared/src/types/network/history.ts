import type { IErrorResponse } from './errors.js';

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
    ERROR: (error: IErrorResponse) => void;
}

/**
 * Basic game summary for listing in history
 */
export interface IGameHistoryEntry {
    readonly gameCode: string;
    readonly startTime: string;
    readonly endTime?: string;
    readonly players: readonly string[];
    readonly winner?: string;
    readonly totalMoves: number;
}