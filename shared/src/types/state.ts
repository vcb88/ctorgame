import type {
    ITimestamp,
    IVersioned,
    IExpiration,
    IData
} from './core/primitives.js';

import type {
    IBoardSize,
    PlayerNumber,
    GameStatus,
    IGameMove
} from './game/types.js';

// Board interfaces
export interface IBoardBase {
    readonly size: IBoardSize;
    cells: Array<Array<number>>; // Simplified cell type
}

export interface IBoard extends IBoardBase {}

// Score interfaces
export interface IGameScores {
    readonly player1: number;
    readonly player2: number;
}

// Turn state interfaces
export interface ITurnStateBase {
    readonly placeOperationsLeft: number;
    readonly replaceOperationsLeft: number;
}

export interface ITurnState extends ITurnStateBase {
    readonly moves: ReadonlyArray<IGameMove>;
    readonly count: number; // Total moves count for validation
}

// Game state interfaces
export interface IGameStateBase {
    readonly board: IBoard;
    readonly gameOver: boolean;
    readonly winner: PlayerNumber | null;
    readonly currentPlayer: PlayerNumber;
    readonly isFirstTurn: boolean;
}

export interface IGameState extends IGameStateBase {
    readonly currentTurn: ITurnState;
    readonly scores: IGameScores;
}

// Game manager state interfaces
export interface IGameManagerBase {
    readonly status: GameStatus;
    readonly error: Error | null;
    readonly connectionState: string;
}

export interface GameManagerState extends IGameManagerBase, ITimestamp {
    readonly gameId: string | null;
    readonly playerNumber: PlayerNumber | null;
    readonly lastUpdated: number;
}

// Stored state interfaces
export interface IStoredStateBase<T> extends IVersioned, ITimestamp, IData<T> {}

export interface StoredState<T> extends IStoredStateBase<T>, IExpiration {}

// State storage interfaces
export interface IStateStorageBase {
    getKeys(prefix?: string): ReadonlyArray<string>;
}

export interface IStateStorage extends IStateStorageBase {
    saveState(key: string, state: unknown): void;
    loadState<T>(key: string): T | null;
    cleanupExpired(): void;
    removeState(key: string): void;
}