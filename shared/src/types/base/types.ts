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
    | 'connect'
    | 'disconnect'
    | 'error'
    | 'create_game'
    | 'join_game'
    | 'make_move'
    | 'game_state'
    | 'game_error'
    | 'game_created'
    | 'game_started'
    | 'game_joined'
    | 'game_move'
    | 'game_ended'
    | 'game_expired'
    | 'player_connected'
    | 'player_disconnected'
    | 'turn_ended'
    | 'game_state_updated';

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

export type GameMove = {
    type: MoveType;
    player: PlayerNumber;
    position: Position;
    timestamp: Timestamp;
    replacements?: Position[];
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
    gameId?: UUID;
    playerId?: string;
    player?: PlayerNumber;
    data?: unknown;
    timestamp: Timestamp;
};

export type ServerToClientEvents = {
    'game_state': (state: GameState) => void;
    'game_error': (error: GameError) => void;
    'game_created': (event: { gameId: UUID; code: string; eventId: string; status: GameStatus; timestamp: number; type: 'game_created' }) => void;
    'game_joined': (event: { gameId: UUID; eventId: string; status: GameStatus; timestamp: number; type: 'game_joined' }) => void;
    'game_started': (event: { gameId: UUID; eventId: string; gameState: GameState; currentPlayer: PlayerNumber; timestamp: number; type: 'game_started' }) => void;
    'player_joined': (player: Player) => void;
    'player_left': (player: Player) => void;
    'game_over': (winner: PlayerNumber) => void;
    'error': (error: NetworkError) => void;
    'game_state_updated': (state: GameState) => void;
    'game_move': (move: GameMove) => void;
    'game_ended': (event: { gameId: UUID; eventId: string; winner: PlayerNumber; finalScores: Scores; timestamp: number }) => void;
    'game_expired': (gameId: UUID) => void;
    'turn_ended': (currentPlayer: PlayerNumber) => void;
    'player_connected': (player: Player) => void;
    'player_disconnected': (player: Player) => void;
};

export type ClientToServerEvents = {
    'create_game': (config: { size: Size }) => void;
    'join_game': (gameId: UUID) => void;
    'make_move': (move: GameMove) => void;
    'leave_game': () => void;
};

export type SocketData = {
    playerId?: UUID;
    gameId?: UUID;
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

// Game history types
export type GameHistory = {
    moves: GameMove[];
    states: GameState[];
    timestamps: Timestamp[];
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