/**
 * Single source of truth for all types in the application
 */

// Primitive types
export type Size = [number, number];
export type Position = [number, number];
export type UUID = string;
export type Timestamp = number;
export type Version = string;
export type CellValue = 0 | 1 | 2;  // 0 = empty, 1 = player1, 2 = player2
export type PlayerNumber = 1 | 2;
export type Scores = [number, number];  // [player1Score, player2Score]

// Game status types
export type GameStatus = 'waiting' | 'active' | 'finished';
export type GamePhase = 'setup' | 'play' | 'end';
export type ConnectionStatus = 'connected' | 'disconnected' | 'error';
export type MoveType = 'place' | 'replace' | 'skip';

// Game entities
export type Player = {
    id: UUID;
    number: PlayerNumber;
    connected: boolean;
};

export type Board = CellValue[][];

export type GameSettings = {
    boardSize: Size;
    timeLimit?: number;
    maxPlayers: number;
    turnTimeLimit?: number;
    maxMoves?: number;
};

export type GameState = {
    // Core fields
    id: UUID;
    board: Board;
    players: Player[];
    scores: Scores;

    // Game status
    status: GameStatus;
    phase: GamePhase;
    winner?: Player;

    // Player turn management
    currentPlayer: PlayerNumber;
    currentTurn: TurnState;
    
    // Time tracking
    startTime: Timestamp;
    lastUpdate: Timestamp;
    lastMoveTimestamp: Timestamp;
    
    // Game configuration
    settings: GameSettings;
    
    // Action tracking
    lastAction?: GameAction;
    replacements?: Position[];
};

export type GameMove = {
    player: PlayerNumber;
    position: Position;
    timestamp: Timestamp;
};

export type GameAction = {
    type: MoveType;
    player: PlayerNumber;
    timestamp: Timestamp;
    position?: Position;
    replacements?: Position[];
};

export type TurnState = {
    player: PlayerNumber;
    startTime: Timestamp;
    timeLeft?: number;
    movesLeft?: number;
};

// Error handling types
export type ErrorCategory = 'network' | 'game' | 'validation' | 'system';
export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

export type ValidationResult = {
    isValid: boolean;
    errors: string[];
};

export type NetworkError = {
    code: string;
    message: string;
    category: ErrorCategory;
    severity: ErrorSeverity;
    timestamp: Timestamp;
    details?: Record<string, unknown>;
};

// WebSocket types
export type WebSocketEvent = 'connect' | 'disconnect' | 'error' | 'message' | 'close';

export type GameEvent = {
    type: string;
    timestamp: Timestamp;
    gameId: UUID;
    data?: unknown;
};

export type ServerToClientEvents = {
    error: (error: NetworkError) => void;
    game_state: (state: GameState) => void;
    game_move: (move: GameMove) => void;
};

export type ClientToServerEvents = {
    join_game: (gameId: string) => void;
    make_move: (move: GameMove) => void;
    leave_game: () => void;
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

// Utility types
export type WithMetadata<T> = T & {
    metadata?: Record<string, unknown>;
};

export type Collection<T> = Array<T>;