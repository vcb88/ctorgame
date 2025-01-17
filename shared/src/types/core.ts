/**
 * Core types for the MVP version
 * Single source of truth for all shared type definitions
 */

/** Basic primitive types */
export type Position = [number, number];
export type Size = [number, number];
export type PlayerNumber = 1 | 2;
export type Scores = [number, number];
export type Timestamp = number;
export type UUID = string;

/** Game status and phases */
export type GameStatus = 'waiting' | 'active' | 'finished';
export type GamePhase = 'setup' | 'play' | 'end';
export type ConnectionStatus = 'connected' | 'disconnected' | 'error';

/** Move related types */
export type MoveType = 'place' | 'replace' | 'skip';
export type CellValue = PlayerNumber | null;

export type GameMove = {
    type: MoveType;
    pos?: Position;
};

/** Player and game state */
export type Player = {
    id: string;
    num: PlayerNumber;
    connected: boolean;
};

export interface GameState {
    id: UUID;
    size: Size;
    board: CellValue[][];
    scores: Scores;
    currentPlayer: PlayerNumber;
    status: GameStatus;
    winner?: PlayerNumber;
    lastMove?: GameMove;
    timestamp: number;
    code?: string;
    players?: Players;
    playerId?: string;
    playerNum?: PlayerNumber;
};

/** Error handling */
export interface GameError extends BaseError {
    category: 'game';
    code: ErrorCode;
    severity: ErrorSeverity;
};

export type ValidationResult = {
    valid: boolean;
    message?: string;
};

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
    | 'INVALID_GAME_ID'
    | 'INTERNAL_ERROR';
export type ErrorCategory = 'validation' | 'network' | 'game' | 'storage';
export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface BaseError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    category: ErrorCategory;
    severity: ErrorSeverity;
    stack?: string;
    cause?: unknown;
    timestamp?: number;
}

export interface NetworkError extends BaseError {
    category: 'network';
    code: ErrorCode;
    severity: ErrorSeverity;
};

export interface ValidationError extends BaseError {
    category: 'validation';
    code: ErrorCode;
    severity: ErrorSeverity;
    field?: string;
};

/** Redis and Storage types */
export interface RedisGameState {
    gameId: UUID;
    boardState: string;
    currentPlayer: PlayerNumber;
    scores: Scores;
    status: GameStatus;
    timestamp: number;
    ttl?: number;
}

export interface RedisGameEvent {
    eventId: UUID;
    type: string;
    gameId: UUID;
    data: Record<string, unknown>;
    timestamp: number;
    ttl?: number;
}

/** Game metadata and history types */
export type BoardSize = {
    width: number;
    height: number;
};

export type Players = {
    first?: string;
    second?: string;
};

export interface GameMetadata {
    gameId: UUID;
    code: string;
    status: GameStatus | 'expired';
    startTime: string;
    lastActivityAt: string;
    expiresAt: string;
    players: Players;
    boardSize: BoardSize;
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

export interface GameDetails {
    currentState: GameState;
    moves: GameMove[];
    timing: {
        moveTimes: number[];
        avgMoveTime: number;
    };
    territoryHistory: Array<{ player1: number; player2: number }>;
    gameId?: UUID;
    timestamp?: Timestamp;
};

export interface GameHistory {
    metadata: GameMetadata;
    moves: GameMove[];
    details: GameDetails;
    timestamp?: Timestamp;
    version?: string;
};

/** WebSocket Types */
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

export type WebSocketErrorCode = 
    | 'INVALID_EVENT'
    | 'INVALID_DATA'
    | 'SERVER_ERROR'
    | 'INVALID_GAME_ID'
    | 'INVALID_STATE'
    | 'NOT_YOUR_TURN'
    | 'GAME_ENDED'
    | 'GAME_NOT_FOUND'
    | 'GAME_FULL'
    | 'GAME_EXPIRED'
    | 'NETWORK_ERROR'
    | 'VALIDATION_ERROR'
    | 'server_error'
    | 'invalid_game_id'
    | 'invalid_state'
    | 'invalid_move'
    | 'invalid_position'
    | 'not_your_turn'
    | 'game_ended'
    | 'game_not_found'
    | 'game_full'
    | 'game_expired'
    | 'storage_error';

export type GameEvent = {
    type: WebSocketEvent;
    id: string;
    gameId?: UUID;
    playerId?: string;
    player?: PlayerNumber;
    data?: unknown;
    timestamp: Timestamp;
};

export type EventType = WebSocketEvent | 'internal_error' | 'state_update';

export type ServerToClientEvents = {
    'game_state': (state: GameState) => void;
    'game_error': (error: GameError) => void;
    'game_created': (event: { gameId: UUID; code: string; eventId: string; status: GameStatus; timestamp: number; type: 'game_created' }) => void;
    'game_joined': (event: { gameId: UUID; eventId: string; status: GameStatus; timestamp: number; type: 'game_joined' }) => void;
    'game_started': (event: { gameId: UUID; eventId: string; gameState: GameState; currentPlayer: PlayerNumber; timestamp: number; type: 'game_started' }) => void;
    'player_joined': (player: Player) => void;
    'player_left': (player: Player) => void;
    'game_over': (winner: PlayerNumber) => void;
    'error': (error: { code: WebSocketErrorCode; message: string; details?: Record<string, unknown> }) => void;
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

export type InterServerEvents = Record<string, never>;

export type SocketData = {
    playerId?: UUID;
    gameId?: UUID;
};

export type WebSocketTransport = 'websocket' | 'polling';

export type WebSocketServerConfig = {
    cors: {
        origin: string;
        methods: string[];
    };
    path: string;
    transports: WebSocketTransport[];
    serveClient: boolean;
    pingTimeout: number;
    pingInterval: number;
    upgradeTimeout: number;
    maxHttpBufferSize: number;
    reconnectTimeout?: number;
    storageService?: any;
    eventService?: any;
    redisService?: any;
};

export type WebSocketServerOptions = {
    cors: {
        origin: string;
        methods: string[];
    };
};

/** TTL Configuration */
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

/** Generic collection type */
export type Collection<T> = T[];

/** Generic type for data with metadata */
export type WithMetadata<T> = {
    data: T;
    timestamp: Timestamp;
    version?: string;
};