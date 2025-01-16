/**
 * State manager types
 */

import type { UUID, Timestamp } from '../core/primitives.js';
import type { GameState, GameSettings } from './game.js';
import type { GameMove, MoveValidation } from './moves.js';
import type { StateStorageOptions } from './storage.js';

/** Manager configuration */
export interface StateManagerConfig {
    storage: StateStorageOptions;
    validation: {
        validateMoves: boolean;
        validateState: boolean;
        strict: boolean;
    };
    autoSave: boolean;
    snapshotting: boolean;
}

/** Manager state */
export interface ManagerState {
    gameId: UUID;
    currentState: GameState;
    lastOperation: string;
    lastModified: Timestamp;
    error: Error | null;
}

/** State transition */
export interface StateTransition {
    from: GameState;
    to: GameState;
    move?: GameMove;
    validation?: MoveValidation;
    timestamp: Timestamp;
}

/** State manager interface */
export interface StateManager {
    /** Get current state */
    getState(): GameState;

    /** Create new game */
    createGame(settings: GameSettings): GameState;

    /** Apply move */
    applyMove(move: GameMove): MoveValidation;

    /** Save state */
    saveState(): void;

    /** Load state */
    loadState(id: UUID): GameState;

    /** Reset state */
    resetState(): void;

    /** Validate state */
    validateState(): boolean;
}