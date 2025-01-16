/**
 * Move state types
 */

import type { Position, PlayerNumber, Timestamp, MoveType, ValidationResult } from '../base/primitives.js';
import type { GameState } from './game.js';

/** Basic move */
export type Move = {
    type: MoveType;
    position?: Position;
};

/** Validated move with replacements */
export type ValidatedMove = Move & {
    replacements?: Position[];
    affects?: Position[];
};

/** Game move with player info */
export type GameMove = ValidatedMove & {
    player: PlayerNumber;
    timestamp: Timestamp;
    moveNumber: number;
};

/** Move validation result with affected positions */
export interface MoveValidation extends ValidationResult {
    reason?: string;
    replacements?: Position[];
    affects?: Position[];
}

/** Turn state */
export type TurnState = {
    currentPlayer: PlayerNumber;
    moves: GameMove[];
    placeOperationsLeft: number;
    replaceOperationsLeft: number;
    moveCount: number;
    startTime: Timestamp;
    timeLeft?: number;
};

/** Move history entry */
export type MoveHistoryEntry = {
    move: GameMove;
    resultingState: GameState;
    timestamp: Timestamp;
};