/**
 * Redis session types
 */
import type { RedisBase } from './state.js';
import type { PlayerNumber } from '../core.js';
import type { UUID, Timestamp } from '../core/primitives.js';

/** Connection information */
export interface RedisConnectionInfo {
    ip: string;
    userAgent?: string;
    platform?: string;
    browserInfo?: string;
    lastActivity: Timestamp;
    connectTime: Timestamp;
    disconnectTime?: Timestamp;
}

/** Session activity */
export interface RedisSessionActivity {
    lastMoveTime?: Timestamp;
    lastChatTime?: Timestamp;
    lastPingTime?: Timestamp;
    idleTime: number;
    moveCount: number;
    chatCount: number;
}

/** Player session in Redis */
export interface RedisPlayerSession extends RedisBase {
    id: UUID;
    gameId: UUID;
    playerId: UUID;
    playerNumber: PlayerNumber;
    connection: RedisConnectionInfo;
    activity: RedisSessionActivity;
    settings?: {
        notifications?: boolean;
        sound?: boolean;
        theme?: string;
    };
}

/** Session analytics data */
export interface RedisSessionAnalytics {
    totalGames: number;
    wins: number;
    losses: number;
    draws: number;
    totalPlayTime: number;
    averageGameDuration: number;
    preferredGameMode?: string;
}

/** Session metadata */
export interface RedisSessionMetadata extends RedisBase {
    sessionId: UUID;
    userId?: UUID;
    createdAt: Timestamp;
    lastRefresh: Timestamp;
    analytics?: RedisSessionAnalytics;
    features?: Set<string>;
}

/** Type guards */
export function isRedisPlayerSession(value: unknown): value is RedisPlayerSession {
    if (!value || typeof value !== 'object') return false;
    const session = value as RedisPlayerSession;
    return (
        typeof session.id === 'string' &&
        typeof session.gameId === 'string' &&
        typeof session.playerId === 'string' &&
        (session.playerNumber === 1 || session.playerNumber === 2) &&
        typeof session.connection === 'object' &&
        typeof session.activity === 'object'
    );
}

export function isRedisSessionMetadata(value: unknown): value is RedisSessionMetadata {
    if (!value || typeof value !== 'object') return false;
    const metadata = value as RedisSessionMetadata;
    return (
        typeof metadata.sessionId === 'string' &&
        typeof metadata.createdAt === 'number' &&
        typeof metadata.lastRefresh === 'number' &&
        typeof metadata.expiresAt === 'number'
    );
}