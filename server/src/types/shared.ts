// Re-export types from game module
export type {
    IGameState,
    IGameMove,
    PlayerNumber,
    GameStatus,
    IPlayer,
    IGameScores
} from '@ctor-game/shared/dist/types/game/types.js';

// Re-export types from geometry module
export type {
    IPosition,
    ISize
} from '@ctor-game/shared/dist/types/geometry/types.js';

// Re-export network types
export type {
    IWebSocketErrorCode as WebSocketErrorCode,
    IWebSocketEvent as WebSocketEvent,
    IClientToServerEvents as ClientToServerEvents,
    IServerToClientEvents as ServerToClientEvents
} from '@ctor-game/shared/dist/types/network/websocket.js';

export type {
    IErrorResponse,
    ErrorCode
} from '@ctor-game/shared/dist/types/network/errors.js';

export type {
    GameEvent as IGameEvent,
    IGameCreatedEvent,
    IGameStartedEvent,
    IGameMoveEvent,
    IGameEndedEvent,
    IGameExpiredEvent,
    IPlayerConnectedEvent,
    IPlayerDisconnectedEvent,
    IGameErrorEvent
} from '@ctor-game/shared/dist/types/network/events.js';

// Re-export storage types
export type {
    IRedisGameState,
    IRedisPlayerSession,
    IRedisGameRoom,
    IRedisGameEvent
} from '@ctor-game/shared/dist/types/storage/redis.js';

export type {
    GameMetadata as IGameMetadata,
    GameHistory as IGameHistory
} from '@ctor-game/shared/dist/types/storage/metadata.js';

export type {
    HistoryEntry as IHistoryEntry,
    IGameHistory as IGameHistoryRecord
} from '@ctor-game/shared/dist/types/storage/history.js';

// Re-export validation functions
export { 
    validateGameEvent,
    isGameEvent 
} from '@ctor-game/shared/dist/validation/network.js';

// Re-export geometry utils
export { 
    getAdjacentPositions 
} from '@ctor-game/shared/dist/utils/geometry.js';

// Re-export game utils
export { 
    getOpponent
} from '@ctor-game/shared/dist/utils/game.js';

// Re-export error utils
export type { 
    IErrorWithStack
} from '@ctor-game/shared/dist/utils/errors.js';

export { 
    toErrorWithStack,
    createErrorResponse
} from '@ctor-game/shared/dist/utils/errors.js';