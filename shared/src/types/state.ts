import type { PlayerNumber, GameMove, GameError } from './core.js';

/** Board types */
export type BoardBase = {
    width: number;
    height: number;
    cells: (PlayerNumber | null)[][];
};

export type Board = BoardBase & {
    moveHistory: GameMove[];
};

/** Score types */
export type GameScores = {
    [key in PlayerNumber]: number;
};

/** Turn state types */
export type TurnStateBase = {
    player: PlayerNumber;
    moves: GameMove[];
    startTime: number;
};

export type TurnState = TurnStateBase & {
    placeOperations: number;
    replaceOperations: number;
};

/** Game manager types */
export type GameManagerBase = {
    currentState: GameState | null;
    currentPlayer: PlayerNumber | null;
    error: GameError | null;
    connectionState: string;
};

export type StoredStateBase<T> = {
    data: T;
    timestamp: number;
    version: string;
};

export type StateStorageBase = {
    get: <T>(key: string) => Promise<T | null>;
    set: <T>(key: string, value: T) => Promise<void>;
    delete: (key: string) => Promise<void>;
};

export type StateStorage = StateStorageBase & {
    clear: () => Promise<void>;
    getKeys: () => Promise<string[]>;
};