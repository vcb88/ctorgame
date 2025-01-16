/**
 * Redis state types
 */
import type { GameState, Player } from '../game/types.js';
import type { UUID, Timestamp, Version } from '../core/primitives.js';
import { RedisTTLStatusEnum } from './enums.js';

/** Base interface for Redis stored objects */
export interface RedisBase {
    readonly lastUpdate: Timestamp;
    readonly version: Version;
    readonly expiresAt?: Timestamp;
}

/** Game state in Redis */
export interface RedisGameState extends GameState, RedisBase {
    readonly metadata?: {
        readonly lastSnapshot?: Timestamp;
        readonly snapshotInterval?: number;
        readonly backupCount?: number;
    };
}

/** Game room in Redis */
export interface RedisGameRoom extends RedisBase {
    readonly id: UUID;
    readonly players: ReadonlyArray<Player>;
    readonly status: RedisTTLStatusEnum;
    readonly maxPlayers: number;
    readonly settings?: {
        readonly private?: boolean;
        readonly password?: string;
        readonly timeLimit?: number;
        readonly ranked?: boolean;
    };
}

/** State backup metadata */
export interface RedisStateBackup extends RedisBase {
    readonly id: UUID;
    readonly gameId: UUID;
    readonly snapshotTime: Timestamp;
    readonly checksum: string;
    readonly compressed?: boolean;
}

/** State migration info */
export interface RedisMigrationInfo extends RedisBase {
    readonly fromVersion: Version;
    readonly toVersion: Version;
    readonly status: 'pending' | 'in_progress' | 'completed' | 'failed';
    readonly affectedKeys: number;
    readonly completedKeys: number;
    readonly error?: string;
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