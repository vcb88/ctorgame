/**
 * Move state types
 */

import type { Position } from '../core/primitives.js';
import type { PlayerNumber } from '../game/types.js';
import { MoveOperationEnum } from './enums.js';

/** Basic move interface */
export interface Move {
    readonly type: MoveOperationEnum;
    readonly position?: Position;
}

/** Validated move with replacements */
export interface ValidatedMove extends Move {
    readonly replacements?: ReadonlyArray<Position>;
    readonly affects?: ReadonlyArray<Position>;
}

/** Game move with player info */
export interface GameMove extends ValidatedMove {
    readonly player: PlayerNumber;
    readonly timestamp: number;
    readonly moveNumber: number;
}

/** Move validation result */
export interface MoveValidation {
    readonly valid: boolean;
    readonly reason?: string;
    readonly replacements?: ReadonlyArray<Position>;
    readonly affects?: ReadonlyArray<Position>;
}

/** Turn state */
export interface TurnState {
    readonly currentPlayer: PlayerNumber;
    readonly moves: ReadonlyArray<GameMove>;
    readonly placeOperationsLeft: number;
    readonly replaceOperationsLeft: number;
    readonly moveCount: number;
    readonly startTime: number;
    readonly timeLeft?: number;
}

/** Move history entry */
export interface MoveHistoryEntry {
    readonly move: GameMove;
    readonly resultingState: GameState;
    readonly timestamp: number;
}