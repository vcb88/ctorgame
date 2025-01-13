// Re-export basic types
export { Player } from './basic-types';
export type { 
    IPosition,
    IBoardSize,
    GameStatus
} from './basic-types';

// Re-export base types
export { 
    GamePhase,
    GameOutcome,
    OperationType,
    BOARD_SIZE,
    MIN_ADJACENT_FOR_REPLACE,
    MAX_PLACE_OPERATIONS,
    ErrorCode,
    ErrorSeverity,
    WebSocketErrorCode
} from './base';
export type {
    GameError,
    RecoveryStrategy,
    ConnectionState
} from './base';

// Re-export move types
export type {
    IBasicMove,
    IServerMove,
    GameMove,
    IReplaceValidationBase
} from './moves';

// Re-export state types
export type {
    IBoard,
    IScores,
    ITurnState,
    IGameState,
    GameManagerState,
    StoredState,
    IStateStorage
} from './state';

// Re-export game types
export type {
    IPlayer,
    IGameRoom,
    GameDetails,
    GameMetadata
} from './game';

// Re-export event types
export type {
    IGameEvent,
    ReconnectionData,
    ServerToClientEvents,
    ClientToServerEvents,
    ErrorResponse
} from './events';

// Re-export WebSocket types
export type {
    WebSocketEvents,
    WebSocketPayloads,
    ServerToClientEventType,
    ClientToServerEventType
} from './web-socket-types';

// Re-export replay types
export type {
    GameHistory,
    IReplayState
} from './replay';

// Re-export Redis types
export type {
    IRedisGameState,
    IRedisPlayerSession,
    IRedisGameRoom,
    IRedisGameEvent,
    ICacheConfig
} from './redis';

// Re-export payload types
export type {
    BasicPosition,
    BasicMove
} from './payloads';

// Re-export validation types
export type * from './validation-types';