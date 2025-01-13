import { Player, IBoardSize, IPlayerBase } from './basic-types';
import { GamePhase } from './base';
import { IBasicMove } from './moves';

// Base interfaces for board state
export interface IBoardBase {
    size: IBoardSize;
}

export interface IBoard extends IBoardBase {
    cells: (number | null)[][];
}

// Base interfaces for scores
export interface IScoresBase {
    player1: number;
    player2: number;
}

export interface IScores extends IScoresBase {
    [Player.First]: number;
    [Player.Second]: number;
}

// Base interfaces for turn state
export interface ITurnStateBase {
    placeOperationsLeft: number;
    replaceOperationsLeft: number;
}

export interface ITurnState extends ITurnStateBase {
    moves: Array<IBasicMove>;
}

// Base interfaces for game state
export interface IGameStateBase {
    board: IBoard;
    gameOver: boolean;
    winner: Player | null;
    currentPlayer: Player;
    isFirstTurn: boolean;
}

export interface IGameState extends IGameStateBase {
    currentTurn: ITurnState;
    scores: IScores;
}

// Base interfaces for game manager state
export interface IGameManagerStateBase {
    phase: GamePhase;
    error: Error | null;
    connectionState: string;
}

export interface GameManagerState extends IGameManagerStateBase {
    gameId: string | null;
    playerNumber: Player | null;
    lastUpdated: number;
}

// Base interfaces for stored state
export interface IStoredStateBase<T> {
    version: string;
    timestamp: number;
    data: T;
}

export interface StoredState<T> extends IStoredStateBase<T> {
    expiresAt: number;
}

// Base interfaces for state storage
export interface IStateStorageBase {
    getKeys(prefix?: string): string[];
}

export interface IStateStorage extends IStateStorageBase {
    saveState(key: string, state: any): void;
    loadState<T>(key: string): T | null;
    cleanupExpired(): void;
    removeState(key: string): void;
}