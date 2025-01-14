import type {
    ITimestamped,
    IVersioned,
    IExpiration,
    IData
} from '../core/primitives.js';

import type {
    IGameState,
    PlayerNumber,
    GameStatus,
    IGameScores,
    IGameMove
} from './types.js';

/**
 * Turn state interface
 */
export interface ITurnState {
    readonly placeOperationsLeft: number;
    readonly replaceOperationsLeft: number;
    readonly moves: ReadonlyArray<IGameMove>;
    readonly count: number;
}

/**
 * Game manager state
 */
export interface IGameManagerState {
    readonly status: GameStatus;
    readonly error: Error | null;
    readonly connectionState: string;
    readonly gameId: string | null;
    readonly playerNumber: PlayerNumber | null;
    readonly lastUpdated: number;
}

/**
 * Stored state base interface
 */
export interface IStoredStateBase<T> extends IVersioned, ITimestamped, IData<T> {}

/**
 * Stored state with expiration
 */
export interface IStoredState<T> extends IStoredStateBase<T>, IExpiration {}

/**
 * State storage interface
 */
export interface IStateStorage {
    readonly getKeys: (prefix?: string) => ReadonlyArray<string>;
    readonly saveState: (key: string, state: unknown) => void;
    readonly loadState: <T>(key: string) => T | null;
    readonly cleanupExpired: () => void;
    readonly removeState: (key: string) => void;
}

// Re-export game state types
export type {
    IGameState,
    IGameScores,
    PlayerNumber,
    GameStatus
} from './types.js';