import { Player, IGameState, IScores, IPlayer } from './index.js';

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
    winner?: Player;        // Winner (Player.First or Player.Second)
    finalScore?: IScores;    // Final scores using Player enum
    totalTurns: number;     // Total number of turns
    boardSize: {            // Board dimensions
        width: number;
        height: number;
    };
    currentState?: IGameState;  // Current game state
    isCompleted?: boolean;      // Game completion flag
    gameOver?: boolean;         // Game over flag
    scores?: IScores;          // Current scores using Player enum
    currentPlayer?: Player;     // Current player (First or Second)
}

export interface GameMove {
    player: Player;  // Player enum value
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
    territoryHistory: Array<IScores>;
}

export interface GameHistory {
    metadata: GameMetadata;
    moves: GameMove[];
    details: GameDetails;
}

export type GameStatus = 'waiting' | 'playing' | 'finished';