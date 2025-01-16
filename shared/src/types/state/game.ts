/**
 * Game state types
 */

import type { UUID, Timestamp } from '../core/primitives.js';
import type { Player } from '../game/types.js';
import type { Board } from './board.js';
import type { TurnState } from './moves.js';
import { StatePhaseEnum } from './enums.js';

/** Game scores */
export interface GameScores {
    readonly player1: number;
    readonly player2: number;
}

/** Game settings */
export interface GameSettings {
    readonly boardSize: {
        readonly width: number;
        readonly height: number;
    };
    readonly timeLimit?: number;
    readonly maxPlayers: number;
    readonly turnTimeLimit?: number;
    readonly maxMoves?: number;
}

/** Game state */
export interface GameState {
    readonly id: UUID;
    readonly board: Board;
    readonly players: ReadonlyArray<Player>;
    readonly scores: GameScores;
    readonly currentTurn: TurnState;
    readonly phase: StatePhaseEnum;
    readonly settings: GameSettings;
    readonly startTime: Timestamp;
    readonly lastUpdate: Timestamp;
    readonly winner?: Player;
}

/** Game state snapshot */
export interface GameStateSnapshot {
    readonly state: GameState;
    readonly timestamp: Timestamp;
    readonly version: string;
    readonly metadata?: {
        readonly reason?: string;
        readonly triggerType?: string;
        readonly previousVersion?: string;
    };
}

/** Game state validation */
export interface GameStateValidation {
    readonly valid: boolean;
    readonly errors: string[];
    readonly warnings: string[];
    readonly details?: {
        readonly boardValid: boolean;
        readonly movesValid: boolean;
        readonly scoresValid: boolean;
        readonly stateConsistent: boolean;
    };
}