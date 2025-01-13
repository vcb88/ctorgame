// Re-export primitive types
export type {
    Coordinate,
    Size,
    Timestamp,
    Version,
    UUID,
    PlayerNumber,
    IPosition,
    IBoardSize,
    GameStatus
} from './primitives';

export { Player } from './primitives';

// Re-export enums
export {
    GamePhase,
    GameOutcome,
    OperationType,
    ErrorCode,
    ErrorSeverity,
    ConnectionState,
    WebSocketErrorCode
} from './enums';

// Re-export constants
export {
    BOARD_SIZE,
    MIN_ADJACENT_FOR_REPLACE,
    MAX_PLACE_OPERATIONS
} from './constants';

// Re-export move types
export type {
    IMoveBase,
    IPositionedMoveBase,
    IBasicMove,
    IServerMove,
    GameMove,
    IReplaceValidationBase
} from './moves';

// Re-export game types
export type {
    IGameRoom,
    GameDetails,
    IPlayer,
    GameMetadata
} from './game';

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

// Re-export core validation types
export type * from './validation-types';