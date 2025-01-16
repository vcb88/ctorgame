import type { GameState, GameMove, Position, Timestamp } from '../core.js';

/** Cache configuration */
export type CacheConfig = {
    enabled: boolean;
    ttl: number;
    maxSize?: number;
};

/** Redis specific game state */
export type RedisGameState = GameState & {
    lastUpdate: number;
    expiresAt: number;
};

/** Game history record */
export type GameHistoryRecord = {
    id: string;
    timestamp: Timestamp;
    gameId: string;
    move: GameMove;
    resultingState: GameState;
};

/** Storage metadata */
export type StorageMetadata = {
    timestamp: Timestamp;
    version: string;
    totalGames: number;
    activePlayers: number;
    successfulMoves: number;
    failedMoves: number;
};

/** Operation result */
export type OperationResult<T = unknown> = {
    success: boolean;
    data?: T;
    error?: string;
    timestamp: Timestamp;
};

/** Backup metadata */
export type BackupMetadata = {
    id: string;
    timestamp: Timestamp;
    version: string;
    itemCount: number;
};

/** Storage options */
export type StorageOptions = {
    cache?: CacheConfig;
    backup?: {
        enabled: boolean;
        path: string;
    };
};