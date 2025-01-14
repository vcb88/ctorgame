/**
 * Redis session types
 */
import type { IRedisBase } from './state.js';
import type { PlayerNumber } from '../game/types.js';

/**
 * Player session in Redis
 */
export interface IRedisPlayerSession extends IRedisBase {
    readonly gameId: string;
    readonly playerNumber: PlayerNumber;
    readonly lastActivity: number;
    readonly connectionCount?: number;
    readonly disconnectedAt?: number;
}

/**
 * Session metadata
 */
export interface IRedisSessionMetadata {
    readonly createdAt: number;
    readonly lastRefresh: number;
    readonly expiresAt: number;
    readonly userAgent?: string;
}

/**
 * Type guards
 */
export function isRedisPlayerSession(value: unknown): value is IRedisPlayerSession {
    if (!value || typeof value !== 'object') return false;
    const session = value as IRedisPlayerSession;
    return (
        typeof session.lastUpdate === 'number' &&
        typeof session.gameId === 'string' &&
        (session.playerNumber === 1 || session.playerNumber === 2) &&
        typeof session.lastActivity === 'number'
    );
}

export function isRedisSessionMetadata(value: unknown): value is IRedisSessionMetadata {
    if (!value || typeof value !== 'object') return false;
    const metadata = value as IRedisSessionMetadata;
    return (
        typeof metadata.createdAt === 'number' &&
        typeof metadata.lastRefresh === 'number' &&
        typeof metadata.expiresAt === 'number'
    );
}