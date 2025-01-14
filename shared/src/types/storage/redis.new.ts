import type {
    IGameState,
    IGameMove,
    PlayerNumber,
    UUID,
    GameStatus
} from '../core/base.js';

/**
 * Redis configuration
 */
export interface IRedisConfig {
    readonly host: string;
    readonly port: number;
    readonly password?: string;
    readonly db?: number;
    readonly keyPrefix?: string;
}

/**
 * TTL configuration
 */
export interface IRedisTTL {
    readonly gameState: number;    // Game state TTL in seconds
    readonly playerSession: number; // Player session TTL in seconds
    readonly gameRoom: number;     // Game room TTL in seconds
    readonly eventQueue: {         // Event queue configuration
        readonly default: number;  // Default TTL for events
        readonly maxAge: number;   // Maximum age for important events
        readonly cleanupInterval: number; // Cleanup interval in seconds
    };
}

/**
 * Redis cached game state
 */
export interface IRedisGameState extends IGameState {
    readonly lastUpdate: number;    // Last update timestamp
    readonly version: number;       // State version for optimistic locking
}

/**
 * Redis player session
 */
export interface IRedisPlayerSession {
    readonly gameId: UUID;
    readonly playerNumber: PlayerNumber;
    readonly lastActivity: number;
    readonly reconnectUntil?: number;
}

/**
 * Redis game room
 */
export interface IRedisGameRoom {
    readonly gameId: UUID;
    readonly status: GameStatus;
    readonly players: ReadonlyArray<{
        readonly id: UUID;
        readonly number: PlayerNumber;
    }>;
    readonly lastUpdate: number;
}

/**
 * Redis game event
 */
export interface IRedisGameEvent {
    readonly id: UUID;
    readonly gameId: UUID;
    readonly type: 'move' | 'join' | 'leave' | 'end';
    readonly timestamp: number;
    readonly playerNumber: PlayerNumber;
    readonly data: {
        readonly move?: IGameMove;
        readonly state?: IGameState;
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