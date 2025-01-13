import { GamePhase } from './index.js';

/**
 * Configuration for state storage system
 */
export interface StorageConfig {
    /** Prefix for storage keys to avoid conflicts */
    prefix: string;
    /** Time-to-live in milliseconds for stored states */
    ttl: number;
    /** Version of the storage format */
    version: string;
}

/**
 * Structure for stored state with versioning
 */
export interface StoredState<T> {
    /** Version of the storage format */
    version: string;
    /** Timestamp when the state was saved */
    timestamp: number;
    /** The actual state data */
    data: T;
    /** When this state will expire */
    expiresAt: number;
}

/**
 * Base state structure for GameStateManager
 */
export interface GameManagerState {
    phase: GamePhase;
    gameId: string | null;
    playerNumber: number | null;
    error: any | null;
    connectionState: string;
    lastUpdated: number;
}

/**
 * Function type for migrating states between versions
 */
export type MigrationStrategy = (oldState: any) => GameManagerState;

/**
 * Migration configuration
 */
export interface MigrationConfig {
    version: string;
    migrate: MigrationStrategy;
}

/**
 * Interface for state storage system
 */
export interface IStateStorage {
    /** Save state with key */
    saveState(key: string, state: any): void;
    
    /** Load state by key */
    loadState<T>(key: string): T | null;
    
    /** Remove expired states */
    cleanupExpired(): void;
    
    /** Remove state by key */
    removeState(key: string): void;
    
    /** Get all keys with prefix */
    getKeys(prefix?: string): string[];
}