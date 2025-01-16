/**
 * Storage related types
 */

import type { IGameState, IGameMove } from '../game/types.js';
import type { ITimestamped, IIdentifiable } from '../core/primitives.js';
import type { StorageErrorEnum, StorageOperationEnum, StorageTypeEnum } from './enums.js';
import type { IStorageError } from './errors.js';

/** Cache configuration */
export interface ICacheConfig {
    ttl: number; // Time to live in seconds
    cleanupInterval?: number;
    maxSize?: number; // Maximum number of items
    strategy?: 'lru' | 'fifo'; // Eviction strategy
}

/** Redis specific types using composition */
export interface IRedisGameState extends IGameState {
    lastUpdate: number;
    expiresAt: number;
}

/** Game history record */
export interface IGameHistoryRecord extends ITimestamped, IIdentifiable {
    gameId: string;
    move: IGameMove;
    resultingState: IGameState;
}

/** Storage metadata */
export interface IStorageMetadata extends ITimestamped {
    version: string;
    totalGames: number;
    activePlayers: number;
    storageType: StorageTypeEnum;
    size?: number;
}

/** Operation result */
export interface IOperationResult<T = unknown> {
    success: boolean;
    operation: StorageOperationEnum;
    timestamp: number;
    data?: T;
    error?: IStorageError;
}

/** Backup metadata */
export interface IBackupMetadata extends ITimestamped {
    id: string;
    version: string;
    itemCount: number;
    size: number;
    checksum: string;
}

/** Storage options */
export interface IStorageOptions {
    type: StorageTypeEnum;
    prefix?: string;
    ttl?: number;
    cache?: ICacheConfig;
    backup?: {
        enabled: boolean;
        interval?: number;
        maxBackups?: number;
        path?: string;
    };
}