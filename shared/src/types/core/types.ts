/**
 * Core game types
 */

import type { 
    UUID, PlayerNumber, Position, Timestamp, CellValue, Scores,
    GameStatus, MoveType, ValidationResult 
} from '../base/primitives.js';
import type { Board } from './board.js';

/** Player information */
export interface Player {
    id: UUID;
    num: PlayerNumber;
    connected: boolean;
}

/** Basic game move */
export interface GameMove {
    type: MoveType;
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
    board: Board;
    scores: Scores;
    currentPlayer: PlayerNumber;
    status: GameStatus;
    winner?: PlayerNumber;
    lastMove?: GameMove;
    timestamp: Timestamp;
}

/** Game history entry */
export interface GameHistoryEntry {
    state: GameState;
    move: GameMoveComplete;
}

/** Move validation result with capture positions */
export interface MoveValidation extends ValidationResult {
    captures?: Position[];
}

/** Game error */
export interface GameError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}