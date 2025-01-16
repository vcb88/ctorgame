/**
 * State storage types
 */

import type { UUID, Timestamp, Version } from '../core/primitives.js';
import { StatePersistenceEnum, StateValidationEnum } from './enums.js';
import type { GameState, GameStateSnapshot } from './game.js';

/** Storage options */
export interface StateStorageOptions {
    persistence: StatePersistenceEnum;
    validation: StateValidationEnum;
    versioning: boolean;
    snapshotting?: {
        enabled: boolean;
        interval?: number;
        maxSnapshots?: number;
    };
}

/** State metadata */
export interface StateMetadata {
    id: UUID;
    version: Version;
    created: Timestamp;
    modified: Timestamp;
    expires?: Timestamp;
    snapshotCount?: number;
    size?: number;
}

/** Stored state */
export interface StoredState<T = GameState> {
    data: T;
    metadata: StateMetadata;
}

/** State storage interface */
export interface StateStorage {
    /** Get all state keys with optional prefix */
    getKeys(prefix?: string): Array<string>;

    /** Save state */
    saveState(key: string, state: unknown): void;

    /** Load state */
    loadState<T>(key: string): T | null;

    /** Create snapshot */
    createSnapshot(key: string): GameStateSnapshot;

    /** Load snapshot */
    loadSnapshot(key: string, version: string): GameStateSnapshot | null;

    /** List snapshots */
    listSnapshots(key: string): Array<GameStateSnapshot>;

    /** Remove state */
    removeState(key: string): void;

    /** Clean expired states */
    cleanupExpired(): void;
}