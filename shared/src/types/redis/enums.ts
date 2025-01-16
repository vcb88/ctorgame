/**
 * Redis related enumerations
 */

/** Redis key types */
export enum RedisKeyEnum {
    GAME_STATE = 'game:state',
    GAME_ROOM = 'game:room',
    PLAYER_SESSION = 'player:session',
    EVENT = 'event',
    METADATA = 'metadata'
}

/** Redis event types */
export enum RedisEventEnum {
    MOVE = 'move',
    DISCONNECT = 'disconnect',
    RECONNECT = 'reconnect',
    END_TURN = 'end_turn'
}

/** Redis event status */
export enum RedisEventStatusEnum {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed'
}

/** Game status for TTL */
export enum RedisTTLStatusEnum {
    WAITING = 'waiting',
    PLAYING = 'playing',
    FINISHED = 'finished'
}