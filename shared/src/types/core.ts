/**
 * Core types for the MVP version - re-exports from base/types.ts
 */
export type {
    // Primitive types
    Position,
    Size,
    UUID,
    Timestamp,
    Version,
    CellValue,
    PlayerNumber,
    Scores,
    GameId,
    GameHistorySummary,

    // Game status types
    GameStatus,
    GamePhase,
    ConnectionStatus,
    MoveType,
    
    // Game entities
    Player,
    Board,
    GameSettings,
    TurnState,
    GameMoveBase,
    GameMove,
    GameState,
    GameAction,
    
    // Error types
    ErrorCategory,
    ErrorSeverity,
    ErrorCode,
    BaseError,
    ErrorWithStack,
    GameError,
    NetworkError,
    ValidationError,
    ValidationResult,
    
    // WebSocket types
    WebSocketEvent,
    GameEvent,
    ServerToClientEvents,
    ClientToServerEvents,
    SocketData,
    WebSocketErrorCode,
    InterServerEvents,
    WebSocketServerConfig,
    WebSocketServerOptions,
    ReplayState,
    ReplayEvent,
    PlaybackSpeed,
    
    // Storage types
    StorageConfig,
    StoredState,
    TTLConfig,
    TTLConfigBase,
    TTLStrategy,
    
    // Game metadata and history types
    GameMetadata,
    GameHistory,
    GameDetails,
    
    // Utility types
    WithMetadata,
    Collection,

    // Redis specific types
    RedisConnectionInfo,
    RedisSessionActivity,
    RedisPlayerSession,
    RedisGameRoom,
    RedisGameState,
    RedisGameEvent,

    // Service interfaces
    GameStorageBase,
    GameEventService,
    RedisServiceType
} from './base/types.js';