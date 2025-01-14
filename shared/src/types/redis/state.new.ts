/**
 * Redis state types
 */
import type { IGameState, IPlayer, GameStatus } from '../game/types.js';

/**
 * Base interface for Redis stored objects
 */
export interface IRedisBase {
    readonly lastUpdate: number;
}

/**
 * Game state in Redis
 */
export interface IRedisGameState extends IGameState, IRedisBase {
    readonly version?: number; // Optional version for state migrations
}

/**
 * Game room in Redis
 */
export interface IRedisGameRoom extends IRedisBase {
    readonly players: ReadonlyArray<IPlayer>;
    readonly status: GameStatus;
    readonly maxPlayers?: number;
    readonly expiresAt?: number;
}

/**
 * Type guards
 */
export function isRedisGameState(value: unknown): value is IRedisGameState {
    return (
        typeof value === 'object' &&
        value !== null &&
        'lastUpdate' in value &&
        typeof (value as IRedisGameState).lastUpdate === 'number'
    );
}

export function isRedisGameRoom(value: unknown): value is IRedisGameRoom {
    if (!value || typeof value !== 'object') return false;
    const room = value as IRedisGameRoom;
    return (
        typeof room.lastUpdate === 'number' &&
        Array.isArray(room.players) &&
        typeof room.status === 'string' &&
        ['waiting', 'playing', 'finished'].includes(room.status)
    );
}