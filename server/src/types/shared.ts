// Re-export types from game module
export type {
    IGameState,
    IGameMove,
    PlayerNumber,
    GameStatus,
    IPlayer,
    IGameScores
} from '@ctor-game/shared/types/game/types';

// Re-export types from geometry module
export type {
    IPosition,
    ISize
} from '@ctor-game/shared/types/geometry/types';

// Re-export network types
export type {
    IWebSocketErrorCode as WebSocketErrorCode,
    IWebSocketEvent as WebSocketEvent,
    IClientToServerEvents as ClientToServerEvents,
    IServerToClientEvents as ServerToClientEvents
} from '@ctor-game/shared/types/network/websocket';

export type {
    IErrorResponse,
    ErrorCode
} from '@ctor-game/shared/types/network/errors';

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
} from '@ctor-game/shared/types/network/events';

// Re-export storage types
export type {
    IRedisGameState,
    IRedisPlayerSession,
    IRedisGameRoom,
    IRedisGameEvent
} from '@ctor-game/shared/types/storage/redis';

export type {
    GameMetadata as IGameMetadata,
    GameHistory as IGameHistory
} from '@ctor-game/shared/types/storage/metadata';

export type {
    HistoryEntry as IHistoryEntry,
    IGameHistory as IGameHistoryRecord
} from '@ctor-game/shared/types/storage/history';

// Re-export validation functions
export { 
    validateGameEvent,
    isGameEvent 
} from '@ctor-game/shared/validation/network';

// Re-export geometry utils
export { 
    getAdjacentPositions 
} from '@ctor-game/shared/utils/geometry';

// Re-export game utils
export { 
    getOpponent
} from '@ctor-game/shared/utils/game';

// Re-export error utils
export type { 
    IErrorWithStack
} from '@ctor-game/shared/utils/errors';

export { 
    toErrorWithStack,
    createErrorResponse
} from '@ctor-game/shared/utils/errors';