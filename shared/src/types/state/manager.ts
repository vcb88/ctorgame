/**
 * State manager types
 */

import type { UUID, Timestamp } from '../core/primitives.js';
import type { GameState, GameSettings } from './game.js';
import type { GameMove, MoveValidation } from './moves.js';
import type { StateStorageOptions } from './storage.js';

/** Manager configuration */
export interface StateManagerConfig {
    readonly storage: StateStorageOptions;
    readonly validation: {
        readonly validateMoves: boolean;
        readonly validateState: boolean;
        readonly strict: boolean;
    };
    readonly autoSave: boolean;
    readonly snapshotting: boolean;
}

/** Manager state */
export interface ManagerState {
    readonly gameId: UUID;
    readonly currentState: GameState;
    readonly lastOperation: string;
    readonly lastModified: Timestamp;
    readonly error: Error | null;
}

/** State transition */
export interface StateTransition {
    readonly from: GameState;
    readonly to: GameState;
    readonly move?: GameMove;
    readonly validation?: MoveValidation;
    readonly timestamp: Timestamp;
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