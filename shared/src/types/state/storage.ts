/**
 * State storage types
 */

import type { UUID, Timestamp, Version } from '../core/primitives.js';
import { StatePersistenceEnum, StateValidationEnum } from './enums.js';
import type { GameState, GameStateSnapshot } from './game.js';

/** Storage options */
export interface StateStorageOptions {
    readonly persistence: StatePersistenceEnum;
    readonly validation: StateValidationEnum;
    readonly versioning: boolean;
    readonly snapshotting?: {
        readonly enabled: boolean;
        readonly interval?: number;
        readonly maxSnapshots?: number;
    };
}

/** State metadata */
export interface StateMetadata {
    readonly id: UUID;
    readonly version: Version;
    readonly created: Timestamp;
    readonly modified: Timestamp;
    readonly expires?: Timestamp;
    readonly snapshotCount?: number;
    readonly size?: number;
}

/** Stored state */
export interface StoredState<T = GameState> {
    readonly data: T;
    readonly metadata: StateMetadata;
}

/** State storage interface */
export interface StateStorage {
    /** Get all state keys with optional prefix */
    getKeys(prefix?: string): ReadonlyArray<string>;

    /** Save state */
    saveState(key: string, state: unknown): void;

    /** Load state */
    loadState<T>(key: string): T | null;

    /** Create snapshot */
    createSnapshot(key: string): GameStateSnapshot;

    /** Load snapshot */
    loadSnapshot(key: string, version: string): GameStateSnapshot | null;

    /** List snapshots */
    listSnapshots(key: string): ReadonlyArray<GameStateSnapshot>;

    /** Remove state */
    removeState(key: string): void;

    /** Clean expired states */
    cleanupExpired(): void;
}