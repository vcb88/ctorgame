/**
 * Storage related types
 */

import type { IGameState, IGameMove } from '../game/types.js';
import type { ITimestamped, IIdentifiable } from '../core/primitives.js';
import type { StorageErrorEnum, StorageOperationEnum, StorageTypeEnum } from './enums.js';
import type { IStorageError } from './errors.js';

/** Cache configuration */
export interface ICacheConfig {
    readonly ttl: number; // Time to live in seconds
    readonly cleanupInterval?: number;
    readonly maxSize?: number; // Maximum number of items
    readonly strategy?: 'lru' | 'fifo'; // Eviction strategy
}

/** Redis specific types using composition */
export interface IRedisGameState extends IGameState {
    readonly lastUpdate: number;
    readonly expiresAt: number;
}

/** Game history record */
export interface IGameHistoryRecord extends ITimestamped, IIdentifiable {
    readonly gameId: string;
    readonly move: IGameMove;
    readonly resultingState: IGameState;
}

/** Storage metadata */
export interface IStorageMetadata extends ITimestamped {
    readonly version: string;
    readonly totalGames: number;
    readonly activePlayers: number;
    readonly storageType: StorageTypeEnum;
    readonly size?: number;
}

/** Operation result */
export interface IOperationResult<T = unknown> {
    readonly success: boolean;
    readonly operation: StorageOperationEnum;
    readonly timestamp: number;
    readonly data?: T;
    readonly error?: IStorageError;
}

/** Backup metadata */
export interface IBackupMetadata extends ITimestamped {
    readonly id: string;
    readonly version: string;
    readonly itemCount: number;
    readonly size: number;
    readonly checksum: string;
}

/** Storage options */
export interface IStorageOptions {
    readonly type: StorageTypeEnum;
    readonly prefix?: string;
    readonly ttl?: number;
    readonly cache?: ICacheConfig;
    readonly backup?: {
        readonly enabled: boolean;
        readonly interval?: number;
        readonly maxBackups?: number;
        readonly path?: string;
    };
}