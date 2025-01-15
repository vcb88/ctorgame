// Re-export types and functions from shared module
// Game types
export type {
    IGameState,
    IGameMove,
    PlayerNumber,
    GameStatus,
    ISize,
    IPlayer
} from '@ctor-game/shared/types/game/types.js';

// Network types
export type { 
    WebSocketErrorCode,
    WebSocketEvent,
    ClientToServerEvents,
    ServerToClientEvents
} from '@ctor-game/shared/types/network/websocket.js';

export type {
    IErrorResponse,
    ErrorCode
} from '@ctor-game/shared/types/network/errors.js';

export type {
    IGameEvent,
    IGameCreatedEvent,
    IGameStartedEvent,
    IGameMoveEvent,
    IGameEndedEvent,
    IGameExpiredEvent,
    IPlayerConnectedEvent,
    IPlayerDisconnectedEvent,
    IGameErrorEvent
} from '@ctor-game/shared/types/network/events.js';

// Storage types
export type {
    IRedisGameState,
    IRedisPlayerSession,
    IRedisGameRoom,
    IRedisGameEvent
} from '@ctor-game/shared/types/storage/redis.js';

export type {
    IGameMetadata,
    IGameHistory
} from '@ctor-game/shared/types/storage/metadata.js';

export type {
    IHistoryEntry,
    IGameHistoryRecord
} from '@ctor-game/shared/types/storage/history.js';

// Validation
export { 
    validateGameEvent,
    isGameEvent 
} from '@ctor-game/shared/validation/network.js';

// Utils
export { 
    getAdjacentPositions 
} from '@ctor-game/shared/utils/coordinates.js';

export { 
    getOpponent,
    createScores,
    IErrorWithStack,
    toErrorWithStack,
    createErrorResponse
} from '@ctor-game/shared/utils/errors.js';