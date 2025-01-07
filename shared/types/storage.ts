import { IGameState } from './game';
import { IPlayer } from './player';

export interface GameMetadata {
    gameId: string;           // Unique game identifier
    code: string;            // 4-digit connection code
    status: GameStatus;      // Game status
    startTime: string;       // ISO datetime
    endTime?: string;        // ISO datetime
    duration?: number;       // Game duration in seconds
    lastActivityAt: string;  // ISO datetime
    expiresAt: string;      // ISO datetime
    players: {
        first?: string;      // First player ID
        second?: string;     // Second player ID
    };
    winner?: number;        // Player number (0 or 1)
    finalScore?: {          // Final score
        1: number;          // First player score
        2: number;          // Second player score
    };
    totalTurns: number;     // Total number of turns
    boardSize: {            // Board dimensions
        width: number;
        height: number;
    };
}

export interface GameMove {
    player: number;  // Player number (0 or 1)
    x: number;
    y: number;
    timestamp: number;
    replacements?: Array<[number, number]>;
}

export interface GameDetails {
    moves: GameMove[];
    timing: {
        moveTimes: number[];
        avgMoveTime: number;
    };
    territoryHistory: Array<{
        1: number;
        2: number;
    }>;
}

export interface GameHistory {
    metadata: GameMetadata;
    moves: GameMove[];
    details: GameDetails;
}

export type GameStatus = 'waiting' | 'playing' | 'finished';