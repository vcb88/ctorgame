import type {
    ITimestamped,
    IVersioned,
    IExpiration,
    IData
} from './core/primitives.js';

import type {
    PlayerNumber,
    GameStatus,
    IGameMove
} from './game/types.js';
import type { ISize } from './geometry/types.js';

// Board interfaces
export interface IBoardBase {
    size: ISize;
    cells: Array<Array<number>>; // Simplified cell type
}

export interface IBoard extends IBoardBase {}

// Score interfaces
export interface IGameScores {
    player1: number;
    player2: number;
}

// Turn state interfaces
export interface ITurnStateBase {
    placeOperationsLeft: number;
    replaceOperationsLeft: number;
}

export interface ITurnState extends ITurnStateBase {
    moves: Array<IGameMove>;
    count: number; // Total moves count for validation
}

// Game state interfaces
export interface IGameStateBase {
    board: IBoard;
    gameOver: boolean;
    winner: PlayerNumber | null;
    currentPlayer: PlayerNumber;
    isFirstTurn: boolean;
}

export interface IGameState extends IGameStateBase {
    currentTurn: ITurnState;
    scores: IGameScores;
}

// Game manager state interfaces
export interface IGameManagerBase {
    status: GameStatus;
    error: Error | null;
    connectionState: string;
}

export interface GameManagerState extends IGameManagerBase, ITimestamped {
    gameId: string | null;
    playerNumber: PlayerNumber | null;
    lastUpdated: number;
}

// Stored state interfaces
export interface IStoredStateBase<T> extends IVersioned, ITimestamped, IData<T> {}

export interface StoredState<T> extends IStoredStateBase<T>, IExpiration {}

// State storage interfaces
export interface IStateStorageBase {
    getKeys(prefix?: string): Array<string>;
}

export interface IStateStorage extends IStateStorageBase {
    saveState(key: string, state: unknown): void;
    loadState<T>(key: string): T | null;
    cleanupExpired(): void;
    removeState(key: string): void;
}