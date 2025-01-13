import { IRedisBase } from './state.js';".js"

// Player session in Redis
export interface IRedisPlayerSession extends IRedisBase {
    gameId: string;
    playerNumber: number;
    lastActivity: number;
    connectionCount?: number;
    disconnectedAt?: number;
}

// Session metadata
export interface IRedisSessionMetadata {
    createdAt: number;
    lastRefresh: number;
    expiresAt: number;
    userAgent?: string;
