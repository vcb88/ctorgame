/**
 * Redis session types
 */
import type { RedisBase } from './state.js';
import type { PlayerNumber } from '../game/types.js';
import type { UUID, Timestamp } from '../core/primitives.js';

/** Connection information */
export interface RedisConnectionInfo {
    readonly ip: string;
    readonly userAgent?: string;
    readonly platform?: string;
    readonly browserInfo?: string;
    readonly lastActivity: Timestamp;
    readonly connectTime: Timestamp;
    readonly disconnectTime?: Timestamp;
}

/** Session activity */
export interface RedisSessionActivity {
    readonly lastMoveTime?: Timestamp;
    readonly lastChatTime?: Timestamp;
    readonly lastPingTime?: Timestamp;
    readonly idleTime: number;
    readonly moveCount: number;
    readonly chatCount: number;
}

/** Player session in Redis */
export interface RedisPlayerSession extends RedisBase {
    readonly id: UUID;
    readonly gameId: UUID;
    readonly playerId: UUID;
    readonly playerNumber: PlayerNumber;
    readonly connection: RedisConnectionInfo;
    readonly activity: RedisSessionActivity;
    readonly settings?: {
        readonly notifications?: boolean;
        readonly sound?: boolean;
        readonly theme?: string;
    };
}

/** Session analytics data */
export interface RedisSessionAnalytics {
    readonly totalGames: number;
    readonly wins: number;
    readonly losses: number;
    readonly draws: number;
    readonly totalPlayTime: number;
    readonly averageGameDuration: number;
    readonly preferredGameMode?: string;
}

/** Session metadata */
export interface RedisSessionMetadata extends RedisBase {
    readonly sessionId: UUID;
    readonly userId?: UUID;
    readonly createdAt: Timestamp;
    readonly lastRefresh: Timestamp;
    readonly analytics?: RedisSessionAnalytics;
    readonly features?: Set<string>;
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