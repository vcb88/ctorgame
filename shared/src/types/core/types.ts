/**
 * Core game types
 */

import type { UUID, PlayerNumber, Position, Timestamp, CellValue, Scores } from './primitives.js';
import { GameStatusEnum, MoveTypeEnum, ConnectionStatusEnum } from './enums.js';

/** Player information */
export interface Player {
    id: UUID;
    num: PlayerNumber;
    connected: boolean;
}

/** Basic game move */
export interface GameMove {
    type: MoveTypeEnum;
    pos?: Position;
}

/** Complete move information */
export interface GameMoveComplete extends GameMove {
    timestamp: Timestamp;
    gameId: UUID;
    moveNumber: number;
}

/** Game state */
export interface GameState {
    board: Array<Array<CellValue>>;
    scores: Scores;
    currentPlayer: PlayerNumber;
    status: GameStatusEnum;
    winner?: PlayerNumber;
    lastMove?: GameMove;
    timestamp: Timestamp;
}

/** Game history entry */
export interface GameHistoryEntry {
    state: GameState;
    move: GameMoveComplete;
}

/** Move validation result */
export interface MoveValidation {
    valid: boolean;
    message?: string;
    captures?: Array<Position>;
}

/** Game error */
export interface GameError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}