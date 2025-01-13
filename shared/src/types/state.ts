import { Player, IBoardSize } from './basic-types';
import { GamePhase } from './base';
import { IBasicMove } from './moves';

// Basic game state interfaces
export interface IBoard {
    cells: (number | null)[][];
    size: IBoardSize;
}

export interface IScores {
    player1: number;
    player2: number;
    [Player.First]: number;
    [Player.Second]: number;
}

export interface ITurnState {
    placeOperationsLeft: number;
    replaceOperationsLeft: number;
    moves: Array<IBasicMove>;
}

export interface IGameState {
    board: IBoard;
    gameOver: boolean;
    winner: Player | null;
    currentTurn: ITurnState;
    currentPlayer: Player;
    scores: IScores;
    isFirstTurn: boolean;
}

export interface GameManagerState {
    phase: GamePhase;
    gameId: string | null;
    playerNumber: Player | null;
    error: Error | null;
    connectionState: string;
    lastUpdated: number;
}

export interface StoredState<T> {
    version: string;
    timestamp: number;
    data: T;
    expiresAt: number;
}

export interface IStateStorage {
    saveState(key: string, state: any): void;
    loadState<T>(key: string): T | null;
    cleanupExpired(): void;
    removeState(key: string): void;
    getKeys(prefix?: string): string[];
}