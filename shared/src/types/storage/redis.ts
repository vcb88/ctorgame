import type { GameState, GameMove, PlayerNumber, GameStatus, UUID } from '../core.js';

/** Redis configuration */
export type RedisConfig = {
    host: string;
    port: number;
    password?: string;
    db?: number;
};

/** Redis TTL configuration */
export type RedisTTL = {
    session: number;   // Player session TTL in seconds
    game: number;      // Game state TTL in seconds
    room: number;      // Game room TTL in seconds
};

/** Redis cached game state */
export type RedisGameState = GameState & {
    lastUpdate: number;    // Last update timestamp
    version: number;       // State version for optimistic locking
};

/** Redis player session */
export type RedisPlayerSession = {
    playerId: UUID;
    playerNumber: PlayerNumber;
    gameId: UUID;
    connected: boolean;
    lastSeen: number;
};

/** Redis game room */
export type RedisGameRoom = {
    gameId: UUID;
    status: GameStatus;
    players: RedisPlayerSession[];
    created: number;
    lastUpdate: number;
};

/** Redis game event */
export type RedisGameEvent = {
    eventId: UUID;
    gameId: UUID;
    playerId: UUID;
    playerNumber: PlayerNumber;
    data: {
        move?: GameMove;
        state?: GameState;
    };
};