/**
 * Core game types
 */

import type { UUID, PlayerNumber, Position, Timestamp, CellValue, Scores } from './primitives.js';
import { GameStatusEnum, MoveTypeEnum, ConnectionStatusEnum } from './enums.js';

/** Player information */
export interface Player {
    readonly id: UUID;
    readonly num: PlayerNumber;
    readonly connected: boolean;
}

/** Basic game move */
export interface GameMove {
    readonly type: MoveTypeEnum;
    readonly pos?: Position;
}

/** Complete move information */
export interface GameMoveComplete extends GameMove {
    readonly timestamp: Timestamp;
    readonly gameId: UUID;
    readonly moveNumber: number;
}

/** Game state */
export interface GameState {
    readonly board: ReadonlyArray<ReadonlyArray<CellValue>>;
    readonly scores: Scores;
    readonly currentPlayer: PlayerNumber;
    readonly status: GameStatusEnum;
    readonly winner?: PlayerNumber;
    readonly lastMove?: GameMove;
    readonly timestamp: Timestamp;
}

/** Game history entry */
export interface GameHistoryEntry {
    readonly state: GameState;
    readonly move: GameMoveComplete;
}

/** Move validation result */
export interface MoveValidation {
    readonly valid: boolean;
    readonly message?: string;
    readonly captures?: ReadonlyArray<Position>;
}

/** Game error */
export interface GameError {
    readonly code: string;
    readonly message: string;
    readonly details?: Record<string, unknown>;
}