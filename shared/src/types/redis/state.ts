/**
 * Redis state types
 */
import type { GameState, Player } from '../game/types.js';
import type { UUID, Timestamp, Version } from '../core/primitives.js';
import { RedisTTLStatusEnum } from './enums.js';

/** Base interface for Redis stored objects */
export interface RedisBase {
    lastUpdate: Timestamp;
    version: Version;
    expiresAt?: Timestamp;
}

/** Game state in Redis */
export interface RedisGameState extends GameState, RedisBase {
    metadata?: {
        lastSnapshot?: Timestamp;
        snapshotInterval?: number;
        backupCount?: number;
    };
}

/** Game room in Redis */
export interface RedisGameRoom extends RedisBase {
    id: UUID;
    players: Array<Player>;
    status: RedisTTLStatusEnum;
    maxPlayers: number;
    settings?: {
        private?: boolean;
        password?: string;
        timeLimit?: number;
        ranked?: boolean;
    };
}

/** State backup metadata */
export interface RedisStateBackup extends RedisBase {
    id: UUID;
    gameId: UUID;
    snapshotTime: Timestamp;
    checksum: string;
    compressed?: boolean;
}

/** State migration info */
export interface RedisMigrationInfo extends RedisBase {
    fromVersion: Version;
    toVersion: Version;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    affectedKeys: number;
    completedKeys: number;
    error?: string;
}

/** Type guards */
export function isRedisGameState(value: unknown): value is RedisGameState {
    return (
        typeof value === 'object' &&
        value !== null &&
        'lastUpdate' in value &&
        'version' in value &&
        typeof (value as RedisGameState).lastUpdate === 'number'
    );
}

export function isRedisGameRoom(value: unknown): value is RedisGameRoom {
    if (!value || typeof value !== 'object') return false;
    const room = value as RedisGameRoom;
    return (
        typeof room.lastUpdate === 'number' &&
        typeof room.version === 'string' &&
        typeof room.id === 'string' &&
        Array.isArray(room.players) &&
        typeof room.status === 'string' &&
        Object.values(RedisTTLStatusEnum).includes(room.status as RedisTTLStatusEnum)
    );
}