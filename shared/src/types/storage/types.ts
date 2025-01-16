/**
 * Storage related types
 */

import type { GameState, IGameMove } from '../game/types.js';
import type { Timestamped, IIdentifiable } from '../core/primitives.js';
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
export interface IRedisGameState extends GameState {
    lastUpdate: number;
    expiresAt: number;
}

/** Game history record */
export interface IGameHistoryRecord extends Timestamped, IIdentifiable {
    gameId: string;
    move: IGameMove;
    resultingState: GameState;
}

/** Storage metadata */
export interface IStorageMetadata extends Timestamped {
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
export interface IBackupMetadata extends Timestamped {
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