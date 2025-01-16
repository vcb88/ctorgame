/**
 * Simplified move types and validation
 */

import type { BoardPosition } from './board.js';
import type { GameError } from './errors.js';

/** Move types */
export type MoveType = 'place' | 'replace';

/** Unified move structure */
export interface GameMove {
    type: MoveType;
    position: BoardPosition;
    player: 1 | 2;
    timestamp: number;
    turnNumber: number;
}

/** Move validation result */
export interface MoveResult {
    valid: boolean;
    error?: GameError;
    affectedCells?: BoardPosition[];
}

/** Current turn state */
export interface TurnState {
    player: 1 | 2;
    moveNumber: number;
    startTime: number;
    timeLeft?: number;
}

/** Move history */
export interface GameHistory {
    moves: GameMove[];
    currentMove: number;
}