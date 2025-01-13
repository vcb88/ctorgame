import {
    ICell,
    IData,
    ITimestamp,
    IVersioned,
    IExpiration
} from './core.js.js';
import { Player, IBoardSize } from './basic-types.js.js';".js"
import { GamePhase } from './base.js.js';".js"
import { IBasicMove } from './moves.js.js';".js"

// Board interfaces
export interface IBoardBase {
    readonly size: IBoardSize;
    cells: Array<Array<ICell['value']>>;
}

export interface IBoard extends IBoardBase {}

// Score interfaces
export interface IBasicScores {
    readonly player1: number;
    readonly player2: number;
}

export interface IScores extends IBasicScores {
    readonly [Player.First]: number;
    readonly [Player.Second]: number;
}

// Turn state interfaces
export interface ITurnStateBase {
    readonly placeOperationsLeft: number;
    readonly replaceOperationsLeft: number;
}

export interface ITurnState extends ITurnStateBase {
    readonly moves: ReadonlyArray<IBasicMove>;
    readonly count: number; // Total moves count for validation
}

// Game state interfaces
export interface IGameStateBase {
    readonly board: IBoard;
    readonly gameOver: boolean;
    readonly winner: Player | null;
    readonly currentPlayer: Player;
    readonly isFirstTurn: boolean;
}

export interface IGameState extends IGameStateBase {
    readonly currentTurn: ITurnState;
    readonly scores: IScores;
}

// Game manager state interfaces
export interface IGameManagerBase {
    readonly phase: GamePhase;
    readonly error: Error | null;
    readonly connectionState: string;
}

export interface GameManagerState extends IGameManagerBase, ITimestamp {
    readonly gameId: string | null;
    readonly playerNumber: Player | null;
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
    saveState(key: string, state: any): void;
    loadState<T>(key: string): T | null;
    cleanupExpired(): void;
    removeState(key: string): void;
