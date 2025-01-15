import {
    Position,
    Size,
    PlayerNumber,
    Scores,
    Player,
    GameMove,
    GameStatus,
    Timestamp,
    CellValue
} from './core.js';

export type {
    Position,
    Size,
    PlayerNumber,
    Scores,
    Player,
    GameMove,
    GameStatus,
    Timestamp,
    CellValue
};

/** Additional primitive types */
export type UUID = string;
export type Version = string;

/** Move types */
export type MoveType = 'place' | 'remove' | 'skip';

/** Complete move information */
export type GameMoveComplete = GameMove & {
    timestamp: number;
    gameId: string;
    moveNumber: number;
};

/** Game state */
export type GameState = {
    board: CellValue[][];
    scores: Scores;
    currentPlayer: PlayerNumber;
    status: GameStatus;
    winner?: PlayerNumber;
    lastMove?: GameMove;
    timestamp: number;
};

/** Game history entry */
export type GameHistoryEntry = {
    state: GameState;
    move: GameMoveComplete;
};

/** Move validation result */
export type MoveValidation = {
    valid: boolean;
    message?: string;
    captures?: Position[];
};
