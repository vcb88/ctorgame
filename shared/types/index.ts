// Re-export all types with explicit exports
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

export {
    IBoard,
    IScores,
    ITurnState,
    IGameState,
    GameManagerState,
    StoredState,
    IStateStorage
} from './state';

export {
    IPlayer,
    IGameRoom,
    GameMove as IGameMove,  // Alias for backward compatibility
    GameDetails,
    GameMetadata
} from './game';

export {
    WebSocketEvents,
    WebSocketPayloads,
    IGameEvent,
    ReconnectionData,
    ServerToClientEvents,
    ClientToServerEvents,
    WebSocketErrorCode
} from './events';

// Additional exports for Redis types
export interface IRedisGameState extends IGameState {
    lastUpdate: number;
}

export interface IRedisPlayerSession {
    gameId: string;
    playerNumber: number;
    lastActivity: number;
}

export interface IRedisGameRoom {
    players: IPlayer[];
    status: GameStatus;
    lastUpdate: number;
}

export interface IRedisGameEvent {
    type: 'move' | 'disconnect' | 'reconnect' | 'end_turn';
    gameId: string;
    playerId: string;
    data: unknown;
    timestamp: number;
}

export interface ICacheConfig {
    ttl: {
        gameState: number;
        playerSession: number;
        gameRoom: number;
    };
}