/**
 * Game state types
 */

import type { UUID, Timestamp, Size, Version, ValidationResult, Scores } from '../base/primitives.js';
import type { Player } from '../game/types.js';
import type { Board } from './board.js';
import type { TurnState } from './moves.js';
import { StatePhaseEnum } from './enums.js';

/** Game settings */
export type GameSettings = {
    boardSize: Size;
    timeLimit?: number;
    maxPlayers: number;
    turnTimeLimit?: number;
    maxMoves?: number;
};

/** Game state */
export type GameState = {
    id: UUID;
    board: Board;
    players: Player[];
    scores: Scores;
    currentTurn: TurnState;
    phase: StatePhaseEnum;
    settings: GameSettings;
    startTime: Timestamp;
    lastUpdate: Timestamp;
    winner?: Player;
};

/** Game state snapshot */
export type GameStateSnapshot = {
    state: GameState;
    timestamp: Timestamp;
    version: Version;
    metadata?: {
        reason?: string;
        triggerType?: string;
        previousVersion?: Version;
    };
};

/** Game state validation details */
export type GameStateValidationDetails = {
    boardValid: boolean;
    movesValid: boolean;
    scoresValid: boolean;
    stateConsistent: boolean;
};

/** Game state validation */
export interface GameStateValidation extends ValidationResult {
    errors: string[];
    warnings: string[];
    details?: GameStateValidationDetails;
}