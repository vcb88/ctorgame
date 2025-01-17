/**
 * Game state types
 */

import type { 
    UUID, 
    Timestamp, 
    Size, 
    Version, 
    ValidationResult, 
    Scores,
    GameStatus,
    PlayerNumber,
    Position
} from '../base/primitives.js';
import type { Player, GameAction } from '../game/types.js';
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

/** Game state - comprehensive type containing all possible fields */
export type GameState = {
    // Core fields
    id: UUID;
    board: Board;
    players: Player[];
    scores: Scores;

    // Game status
    status: GameStatus;
    phase: StatePhaseEnum;
    winner?: Player;

    // Player turn management
    currentPlayer: PlayerNumber;
    currentTurn: TurnState;
    
    // Time tracking
    startTime: Timestamp;
    lastUpdate: Timestamp;
    lastMoveTimestamp: Timestamp;
    
    // Game configuration
    settings: GameSettings;
    
    // Action tracking
    lastAction?: GameAction;
    replacements?: Position[];
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