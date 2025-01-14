/**
 * Storage related types
 */

import type { IGameState, IGameMove } from '../game/types.js';
import type { ITimestamped, IIdentifiable } from '../core/primitives.js';

// Cache configuration
export interface ICacheConfig {
    readonly ttl: number; // Time to live in seconds
    readonly cleanupInterval?: number;
}

// Redis specific types using composition
export interface IRedisGameState extends IGameState {
    readonly lastUpdate: number;
    readonly expiresAt: number;
}

// Game history record
export interface IGameHistoryRecord extends ITimestamped, IIdentifiable {
    readonly gameId: string;
    readonly move: IGameMove;
    readonly resultingState: IGameState;
}

// Storage metadata
export interface IStorageMetadata extends ITimestamped {
    readonly version: string;
    readonly totalGames: number;
    readonly activePlayers: number;
}