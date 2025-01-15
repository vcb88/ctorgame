/**
 * Game specific types
 */

import type { IPosition, ISize } from '../geometry/types.js';
import type { ITimestamped, IIdentifiable } from '../core/primitives.js';

// Enums as union types for better type safety
export type GameStatus = 'waiting' | 'playing' | 'finished';
export type OperationType = 'place' | 'replace';
export type PlayerNumber = 1 | 2;

// Basic game structures
export interface IPlayer extends IIdentifiable {
    readonly number: PlayerNumber;
    readonly connected: boolean;
}

export interface IGameMove {
    readonly type: OperationType;
    readonly position: IPosition;
    readonly player: PlayerNumber;
}

export interface IGameMoveComplete extends IGameMove {
    readonly timestamp: number;
    readonly gameId: string;
    readonly moveNumber: number;
}

export interface IGameScores {
    readonly player1: number;
    readonly player2: number;
}

// Game state using composition
export interface IGameState extends ITimestamped {
    readonly id: string;
    readonly board: ReadonlyArray<ReadonlyArray<number | null>>;
    readonly size: ISize;
    readonly currentPlayer: PlayerNumber;
    readonly status: GameStatus;
    readonly scores: IGameScores;
    readonly lastMove?: IGameMove;
}

// Type for move validation
export interface IMoveValidation {
    readonly valid: boolean;
    readonly message?: string;
    readonly captures?: ReadonlyArray<IPosition>;
}