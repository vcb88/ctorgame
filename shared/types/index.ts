// Re-export base types
export {
    Player,
    GamePhase,
    GameOutcome,
    OperationType,
    BOARD_SIZE,
    MIN_ADJACENT_FOR_REPLACE,
    MAX_PLACE_OPERATIONS,
    IPosition,
    IBoardSize,
    ErrorCode,
    ErrorSeverity,
    GameError,
    RecoveryStrategy,
    GameStatus,
    ConnectionState
} from './base';

// Re-export move types
export {
    IBasicMove,
    IServerMove,
    GameMove,
    IReplaceValidation
} from './moves';

// Re-export state types
export {
    IBoard,
    IScores,
    ITurnState,
    IGameState,
    GameManagerState,
    StoredState,
    IStateStorage
} from './state';

// Re-export game types
export {
    IPlayer,
    IGameRoom,
    GameDetails,
    GameMetadata
} from './game';

// Re-export event types
export {
    WebSocketEvents,
    WebSocketPayloads,
    IGameEvent,
    ReconnectionData,
    ServerToClientEvents,
    ClientToServerEvents,
    WebSocketErrorCode,
    ErrorResponse
} from './events';

// Re-export replay types
export {
    GameHistory,
    IReplayState
} from './replay';

// Re-export Redis types
export {
    IRedisGameState,
    IRedisPlayerSession,
    IRedisGameRoom,
    IRedisGameEvent,
    ICacheConfig
} from './redis';

// Re-export payload types
export {
    BasicPosition,
    BasicMove,
    BaseGamePayload,
    GameCreatedPayload,
    GameJoinedPayload,
    GameStartedPayload,
    GameStateUpdatedPayload,
    GameOverPayload,
    PlayerDisconnectedPayload,
    PlayerReconnectedPayload,
    GameExpiredPayload,
    ErrorPayload,
    AvailableReplacesPayload,
    JoinGamePayload,
    MakeMovePayload,
    EndTurnPayload,
    ReconnectPayload
} from './payloads';

// Re-export validation functions
export { validateGameMove, validateGameState } from '../validation/game';