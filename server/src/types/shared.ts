// Re-export types from game module
export type {
    IGameState,
    IGameMove,
    PlayerNumber,
    GameStatus,
    IPlayer,
    IGameScores
} from '@ctor-game/shared/types/game/types.js';

// Re-export types from geometry module
export type {
    IPosition,
    ISize
} from '@ctor-game/shared/types/geometry/types.js';

// Re-export network types
export type {
    WebSocketErrorCode,
    WebSocketEvent,
    ClientToServerEvents,
    ServerToClientEvents
} from '@ctor-game/shared/types/network/websocket.js';

export type {
    ErrorResponse,
    ErrorCode,
    NetworkError
} from '@ctor-game/shared/types/network/errors.js';

export type {
    GameEvent,
    GameEventType,
    ServerToClientEventType,
    ClientToServerEventType,
} from '@ctor-game/shared/types/network/websocket.js';

// Re-export storage types
export type {
    RedisGameState,
    RedisPlayerSession,
    RedisGameRoom,
    RedisGameEvent
} from '@ctor-game/shared/types/storage/redis.js';

export type {
    GameMetadata,
    GameMeta,
    GameHistory,
    GameStats,
    GameHistoryEntry
} from '@ctor-game/shared/types/storage/metadata.js';

export type GameHistoryRecord = GameHistory;

// Re-export validation functions
export { 
    validateEvent as validateGameEvent
} from '@ctor-game/shared/types/network/websocket.js';

// Re-export geometry utils
export { 
    getAdjacentPositions 
} from '@ctor-game/shared/utils/geometry.js';

// Re-export game utils
export { 
    getOpponent
} from '@ctor-game/shared/utils/game.js';

// Re-export error utils
export type { 
    ErrorWithStack
} from '@ctor-game/shared/types/network/errors.js';

export { 
    toErrorWithStack
} from '@ctor-game/shared/types/network/errors.js';