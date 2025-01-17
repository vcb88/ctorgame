/**
 * Single source of truth for all types in the application
 */

// Primitive types
export type Size = [number, number];
export type Position = [number, number];
export type UUID = string;
export type Timestamp = number;
export type Version = string;
export type CellValue = PlayerNumber | null;
export type PlayerNumber = 1 | 2;
export type Scores = [number, number];  // [player1Score, player2Score]

// ID and reference types
export type GameId = string;  // Unique identifier for a game

// Game history types
export type GameHistorySummary = {
    id: GameId;
    code: string;
    startTime: Timestamp;
    endTime?: Timestamp;
    players: string[];
    winner?: PlayerNumber;
    moves: number;
};

export type GameDetails = {
    currentState: GameState;
    moves: GameMove[];
    timing: {
        moveTimes: number[];
        avgMoveTime: number;
    };
    territoryHistory: Array<{ player1: number; player2: number }>;
};

export type GameHistory = {
    metadata: GameMetadata;
    moves: GameMove[];
    details: GameDetails;
    states?: GameState[];      // Optional array of game states for replay
    timestamps?: Timestamp[];  // Optional timestamps for state transitions
};

// Game status types
export type GameStatus = 'waiting' | 'active' | 'finished' | 'expired';
export type GamePhase = 'setup' | 'play' | 'end';
export type ConnectionStatus = 'connected' | 'disconnected' | 'error';
export type MoveType = 'place' | 'replace' | 'skip';
export type OperationType = MoveType;

// Action types
export type GameAction = {
    type: 'move' | 'validation' | 'state_update' | 'error';
    payload?: unknown;
    timestamp: Timestamp;
};

// Move types hierarchy
export type Move = {
    type: MoveType;
    position?: Position;
};

export type ServerMove = Move & {
    replacements?: Array<Position>;
};

export type ReplaceValidation = ValidationResult & {
    replacements?: Array<Position>;
};

// Error handling types
export type ErrorCode = 
    | 'VALIDATION_ERROR'
    | 'NETWORK_ERROR'
    | 'GAME_ERROR'
    | 'STORAGE_ERROR'
    | 'REDIS_CONNECTION_ERROR'
    | 'REDIS_CLIENT_ERROR'
    | 'OPERATION_TIMEOUT'
    | 'INVALID_EVENT'
    | 'INVALID_DATA'
    | 'SERVER_ERROR'
    | 'INVALID_GAME_ID'
    | 'INVALID_STATE'
    | 'INVALID_MOVE'
    | 'INVALID_POSITION'
    | 'NOT_YOUR_TURN'
    | 'GAME_ENDED'
    | 'GAME_NOT_FOUND'
    | 'GAME_FULL'
    | 'GAME_EXPIRED'
    | 'STORAGE_ERROR'
    | 'WEBSOCKET_ERROR'
    | 'INTERNAL_ERROR';

export type WebSocketEvent = 
    | 'error'
    | 'game_state'
    | 'game_error'
    | 'game_created'
    | 'game_started'
    | 'game_joined'
    | 'game_over'
    | 'game_state_updated'
    | 'game_ended'
    | 'game_expired'
    | 'game_move'
    | 'turn_ended'
    | 'player_connected'
    | 'player_disconnected';

// Game entities
export type Player = {
    id: UUID;
    number: PlayerNumber;
    connected: boolean;
};

export type Board = {
    width: number;
    height: number;
    cells: CellValue[][];
};

export type GameSettings = {
    boardSize: Size;
    timeLimit?: number;
    maxPlayers: number;
    turnTimeLimit?: number;
    maxMoves?: number;
};

export type TurnState = {
    player: PlayerNumber;
    startTime: Timestamp;
    timeLeft?: number;
    movesLeft?: number;
    moves: GameMove[];
    placeOperations: number;
    replaceOperations: number;
};

export type GameMoveBase = {
    type: MoveType;
    position: Position;
    replacements?: Position[];
};

export type GameMove = GameMoveBase & {
    player: PlayerNumber;
    timestamp: Timestamp;
    moveNumber?: number;
};

export type GameState = {
    // Core fields
    id: UUID;
    board: Board;
    players: Player[];
    scores: Scores;
    size: Size;
    code?: string;

    // Game status
    status: GameStatus;
    phase: GamePhase;
    winner?: PlayerNumber | null;
    gameOver?: boolean;

    // Player turn management
    currentPlayer: PlayerNumber;
    currentTurn: TurnState;
    playerNum?: PlayerNumber;
    playerId?: UUID;
    
    // Time tracking
    startTime: Timestamp;
    lastUpdate: Timestamp;
    lastMoveTimestamp: Timestamp;
    timestamp: Timestamp;
    
    // Game configuration
    settings: GameSettings;
    
    // Action tracking
    lastAction?: GameAction;
    lastMove?: GameMove;
    replacements?: Position[];

    // Turn history
    currentTurnMoves?: GameMove[];
    isFirstTurn?: boolean;
};

// Error handling types
export type ErrorCategory = 
    | 'system'
    | 'business'
    | 'validation'
    | 'security'
    | 'game'
    | 'network'
    | 'storage';

export type ErrorSeverity = 
    | 'debug'
    | 'info'
    | 'warning'
    | 'error'
    | 'critical';

export type CommonStatus = 
    // Basic statuses
    | 'active'
    | 'inactive'
    | 'pending'
    | 'completed'
    | 'failed'
    // Process statuses
    | 'initializing'
    | 'processing'
    | 'validating'
    | 'saving'
    // Special statuses
    | 'unknown'
    | 'deprecated'
    | 'maintenance';

export type ResultStatus = 
    | 'success'
    | 'failure'
    | 'partial'
    | 'pending'
    | 'cancelled';

export type WebSocketErrorCode = ErrorCode;

export interface InterServerEvents {
    ping: () => void;
    pong: () => void;
}

export type SocketData = {
    playerId?: UUID;
    gameId?: UUID;
    playerNumber?: PlayerNumber;
};

export interface WebSocketServerConfig {
    cors: {
        origin: string;
        methods: string[];
    };
    path: string;
    pingTimeout?: number;
    pingInterval?: number;
    connectTimeout?: number;
    maxHttpBufferSize?: number;
    allowRequest?: (req: any, callback: (err: string | null, success: boolean) => void) => void;
    transports?: string[];
    allowUpgrades?: boolean;
    upgradeTimeout?: number;
    maxPayload?: number;
}

export interface WebSocketServerOptions {
    config?: Partial<WebSocketServerConfig>;
    reconnectTimeout?: number;
    storageService?: GameStorageBase;
    eventService?: GameEventService;
    redisService?: RedisServiceType;
}

export interface GameStorageBase {
    createGame(playerId: string, gameId: string): Promise<GameState>;
    joinGame(gameId: string, playerId: string): Promise<GameState>;
    makeMove(gameId: string, playerNumber: PlayerNumber, move: GameMove): Promise<GameState>;
}

export interface GameEventService {
    createGameCreatedEvent(gameId: string, status: GameStatus): Promise<GameEvent>;
    createGameStartedEvent(gameId: string, state: GameState): Promise<GameEvent>;
    createGameEndedEvent(gameId: string, winner: PlayerNumber | null, finalState: GameState): Promise<GameEvent>;
    createGameExpiredEvent(gameId: string): Promise<GameEvent>;
    createPlayerConnectedEvent(gameId: string, playerId: string, playerNumber: PlayerNumber): Promise<GameEvent>;
    createPlayerDisconnectedEvent(gameId: string, playerId: string, playerNumber: PlayerNumber): Promise<GameEvent>;
    createGameMoveEvent(gameId: string, playerId: string, move: GameMove, state: GameState): Promise<GameEvent>;
    createErrorEvent(gameId: string, error: NetworkError, playerId?: string): Promise<GameEvent>;
}

export interface RedisServiceType {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getGameState(gameId: string): Promise<GameState | null>;
    setGameState(gameId: string, state: GameState): Promise<void>;
    getPlayerSession(socketId: string): Promise<RedisPlayerSession | null>;
    setPlayerSession(socketId: string, gameId: string, playerNumber: PlayerNumber): Promise<void>;
    removePlayerSession(socketId: string): Promise<void>;
}

// Base error types
export type BaseError = {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    category: ErrorCategory;
    severity: ErrorSeverity;
    stack?: string;
    cause?: unknown;
    timestamp?: number;
};

export type ErrorWithStack = BaseError & {
    stack: string;  // Making stack required
};

export type GameError = BaseError & {
    category: 'game';
    code: ErrorCode;
    severity: ErrorSeverity;
    recoverable?: boolean;
    retryCount?: number;
};

export type NetworkError = BaseError & {
    category: 'network';
    code: ErrorCode;
    severity: ErrorSeverity;
};

export type ValidationError = BaseError & {
    category: 'validation';
    code: ErrorCode;
    severity: ErrorSeverity;
    field?: string;
};

// Validation types
export type ValidationResult = {
    isValid: boolean;
    errors: string[];
    message?: string;
    details?: {
        reason?: string;
        code?: string;
    };
};

// WebSocket types
export type GameEvent = {
    type: WebSocketEvent;
    id: string;
    gameId: string;
    playerId?: string;
    playerNumber?: PlayerNumber;
    timestamp: Timestamp;
    data?: {
        status?: GameStatus;
        state?: GameState;
        move?: GameMove;
        error?: NetworkError;
        winner?: string;
        finalState?: GameState;
        currentPlayer?: PlayerNumber;
    };
};

export type ServerToClientEvents = {
    'game_state': (state: GameState) => void;
    'game_error': (error: GameError) => void;
    'game_created': (event: GameEvent & { 
        code: string;
        status: GameStatus;
    }) => void;
    'game_joined': (event: GameEvent & {
        status: GameStatus;
    }) => void;
    'game_started': (event: GameEvent & {
        gameState: GameState;
        currentPlayer: PlayerNumber;
    }) => void;
    'game_over': (event: GameEvent & {
        winner: string;
        finalState: GameState;
    }) => void;
    'error': (error: NetworkError) => void;
    'game_state_updated': (state: GameState) => void;
    'game_ended': (event: GameEvent & {
        winner: string;
        finalState: GameState;
    }) => void;
    'game_expired': (gameId: string) => void;
    'turn_ended': (currentPlayer: PlayerNumber) => void;
    'player_connected': (playerNumber: PlayerNumber) => void;
    'player_disconnected': (playerNumber: PlayerNumber) => void;
};

export type ClientToServerEvents = {
    'create_game': () => void;
    'join_game': (data: { gameId?: string; code?: string }) => void;
    'make_move': (data: { gameId: string; move: GameMove }) => void;
    'end_turn': (data: { gameId: string }) => void;
    'leave_game': () => void;
};



// Storage types
export type StorageConfig = {
    ttl?: number;
    version?: string;
    metadata?: Record<string, unknown>;
};

export type StoredState<T> = {
    data: T;
    timestamp: Timestamp;
    version: Version;
};

// Game metadata types
export type GameMetadata = {
    gameId: UUID;
    code: string;
    status: GameStatus;
    startTime: string;
    lastActivityAt: string;
    expiresAt: string;
    players: Player[];
    boardSize: Size;
    totalTurns: number;
    endTime?: string;
    winner?: PlayerNumber;
    finalScore?: Scores;
    duration?: number;
    moves?: GameMove[];
    timing?: {
        moveTimes: number[];
        avgMoveTime: number;
    };
    territoryHistory?: Array<{ player1: number; player2: number }>;
};

// Storage and state management types
export type StateStorageBase = {
    get: <T>(key: string) => Promise<T | null>;
    set: <T>(key: string, value: T) => Promise<void>;
    delete: (key: string) => Promise<void>;
};

export type StateStorage = StateStorageBase & {
    clear: () => Promise<void>;
    getKeys: () => Promise<string[]>;
};

export type GameScores = {
    [key in PlayerNumber]: number;
};

export type GameManagerBase = {
    currentState: GameState | null;
    currentPlayer: PlayerNumber | null;
    error: GameError | null;
    connectionState: string;
};

// Redis specific types
export type RedisGameState = GameState & {
    lastUpdate: number;
    version: number;
    ttl?: number;
    boardState?: string;  // Optional for backwards compatibility
};

export type RedisGameEvent = GameEvent & {
    eventId?: UUID;  // Optional for backwards compatibility
    data?: Record<string, unknown>;  // Optional for backwards compatibility
    ttl?: number;
};

// TTL Configuration types
export type TTLConfigBase = {
    gameState: number;
    playerSession: number;
    gameRoom: number;
    events?: number;
};

export type TTLConfig = {
    base: TTLConfigBase;
    active: Omit<TTLConfigBase, 'events'>;
    finished: Omit<TTLConfigBase, 'events'>;
};

export interface TTLStrategy {
    getTTL(key: keyof TTLConfigBase, status: GameStatus): number;
    updateGameTTLs(gameId: string, status: GameStatus): Promise<void>;
    extendGameTTLs(gameId: string): Promise<void>;
}

// Utility types
export type WithMetadata<T> = T & {
    metadata?: Record<string, unknown>;
};

// Replay types
export type ReplayEvent = {
  type: 'replay_start' | 'replay_step' | 'replay_complete' | 'replay_error';
  gameId: UUID;
  timestamp: number;
  data?: {
    move?: GameMove;
    state?: GameState;
    error?: string;
  };
};

// Replay system types
export type ReplayState = {
    currentMoveIndex: number;
    totalMoves: number;
    isPlaying: boolean;
    playbackSpeed: number;
    gameCode: string;
};

export type GameHistoryEntry = {
    gameCode: string;
    startTime: string;
    endTime?: string;
    players: string[];
    winner?: string;
    totalMoves: number;
};

export type Collection<T> = Array<T>;

// Redis specific types
export type RedisConnectionInfo = {
    ip: string;
    lastActivity: number;
    connectTime: number;
};

export type RedisSessionActivity = {
    idleTime: number;
    moveCount: number;
    chatCount: number;
};

export type RedisPlayerSession = {
    id: string;
    gameId: string;
    playerId: string;
    playerNumber: PlayerNumber;
    connection: RedisConnectionInfo;
    activity: RedisSessionActivity;
};

export type RedisGameRoom = {
    gameId: string;
    players: RedisPlayerSession[];
    status: GameStatus;
    lastUpdate: number;
};

//