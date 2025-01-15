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

/** Game state */
export type GameState = {
    board: CellValue[][];
    scores: Scores;
    currentPlayer: PlayerNumber;
    status: GameStatus;
    winner?: PlayerNumber;
};
