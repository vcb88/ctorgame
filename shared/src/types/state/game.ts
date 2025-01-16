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
    player1: number;
    player2: number;
}

/** Game settings */
export interface GameSettings {
    boardSize: {
        width: number;
        height: number;
    };
    timeLimit?: number;
    maxPlayers: number;
    turnTimeLimit?: number;
    maxMoves?: number;
}

/** Game state */
export interface GameState {
    id: UUID;
    board: Board;
    players: Array<Player>;
    scores: GameScores;
    currentTurn: TurnState;
    phase: StatePhaseEnum;
    settings: GameSettings;
    startTime: Timestamp;
    lastUpdate: Timestamp;
    winner?: Player;
}

/** Game state snapshot */
export interface GameStateSnapshot {
    state: GameState;
    timestamp: Timestamp;
    version: string;
    metadata?: {
        reason?: string;
        triggerType?: string;
        previousVersion?: string;
    };
}

/** Game state validation */
export interface GameStateValidation {
    valid: boolean;
    errors: string[];
    warnings: string[];
    details?: {
        boardValid: boolean;
        movesValid: boolean;
        scoresValid: boolean;
        stateConsistent: boolean;
    };
}