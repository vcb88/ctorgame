import type { GameState, IGameMove, PlayerNumber, GameStatus } from '../game/types.js';
type UUID = string;

/**
 * Redis configuration
 */
export interface IRedisConfig {
    host: string;
    port: number;
    password?: string;
    db?: number;
    keyPrefix?: string;
}

/**
 * TTL configuration
 */
export interface IRedisTTL {
    gameState: number;    // Game state TTL in seconds
    playerSession: number; // Player session TTL in seconds
    gameRoom: number;     // Game room TTL in seconds
    eventQueue: {         // Event queue configuration
        default: number;  // Default TTL for events
        maxAge: number;   // Maximum age for important events
        cleanupInterval: number; // Cleanup interval in seconds
    };
}

/**
 * Redis cached game state
 */
export interface IRedisGameState extends GameState {
    lastUpdate: number;    // Last update timestamp
    version: number;       // State version for optimistic locking
}

/**
 * Redis player session
 */
export interface IRedisPlayerSession {
    gameId: UUID;
    playerNumber: PlayerNumber;
    lastActivity: number;
    reconnectUntil?: number;
}

/**
 * Redis game room
 */
export interface IRedisGameRoom {
    gameId: UUID;
    status: GameStatus;
    players: Array<{
        id: UUID;
        number: PlayerNumber;
    }>;
    lastUpdate: number;
}

/**
 * Redis game event
 */
export interface IRedisGameEvent {
    id: UUID;
    gameId: UUID;
    type: 'move' | 'join' | 'leave' | 'end';
    timestamp: number;
    playerNumber: PlayerNumber;
    data: {
        move?: IGameMove;
        state?: GameState;
    };
}

/**
 * Redis key patterns
 */
export const REDIS_KEYS = {
    GAME_STATE: (gameId: UUID) => `game:${gameId}:state`,
    PLAYER_SESSION: (socketId: UUID) => `player:${socketId}:session`,
    GAME_ROOM: (gameId: UUID) => `game:${gameId}:room`,
    GAME_EVENTS: (gameId: UUID) => `game:${gameId}:events`,
    GAME_LOCK: (gameId: UUID) => `game:${gameId}:lock`,
    ACTIVE_GAMES: 'games:active',
    GAME_STATS: 'games:stats'
} as const;