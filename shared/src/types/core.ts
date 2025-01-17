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
    GameMove,
    GameState,
    GameAction,
    
    // Error types
    ErrorCategory,
    ErrorSeverity,
    ErrorCode,
    BaseError,
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
    
    // Storage types
    StorageConfig,
    StoredState,
    TTLConfig,
    TTLConfigBase,
    
    // Game metadata types
    GameMetadata,
    
    // Utility types
    WithMetadata,
    Collection,

    // Redis specific types
    RedisConnectionInfo,
    RedisSessionActivity,
    RedisPlayerSession,
    RedisGameRoom,
    RedisGameState,
    RedisGameEvent
} from './base/types.js';