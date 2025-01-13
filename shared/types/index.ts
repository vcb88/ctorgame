// Basic enums
export enum Player {
    None = 0,
    First = 1,
    Second = 2
}

export enum GamePhase {
    INITIAL = 'INITIAL',
    CONNECTING = 'CONNECTING',
    WAITING = 'WAITING',
    PLAYING = 'PLAYING',
    GAME_OVER = 'GAME_OVER',
    ERROR = 'ERROR'
}

export enum GameOutcome {
    Win = 'WIN',
    Loss = 'LOSS',
    Draw = 'DRAW'
}

export enum OperationType {
    PLACE = 'place',
    REPLACE = 'replace',
    END_TURN = 'end_turn'
}

// Game constants
export const BOARD_SIZE = 10;
export const MIN_ADJACENT_FOR_REPLACE = 5;
export const MAX_PLACE_OPERATIONS = 2;

// Basic interfaces
export interface IPosition {
    x: number;
    y: number;
}

export interface IBoardSize {
    width: number;
    height: number;
}

export interface IBoard {
    cells: (number | null)[][];
    size: IBoardSize;
}

// Game interfaces
export interface IGameMove {
    type: OperationType;
    position: IPosition;
}

export interface IReplaceValidation {
    position: IPosition;
    isValid: boolean;
    adjacentCount: number;
    adjacentPositions: IPosition[];
}

export interface ITurnState {
    placeOperationsLeft: number;
    replaceOperationsLeft: number;
    moves: IGameMove[];
}

export interface IScores {
    player1: number;
    player2: number;
    [Player.First]: number;
    [Player.Second]: number;
}

export interface IGameState {
    board: IBoard;
    gameOver: boolean;
    winner: Player | null;
    currentTurn: ITurnState;
    currentPlayer: Player;
    scores: IScores;
    isFirstTurn: boolean;
}

// Player interfaces
export interface IPlayer {
    id: string;
    number: Player;
}

export interface IGameRoom {
    gameId: string;
    players: IPlayer[];
    currentState: IGameState;
    currentPlayer: Player;
}

// Manager interfaces
export interface GameManagerState {
    phase: GamePhase;
    gameId: string | null;
    playerNumber: Player | null;
    error: Error | null;
    connectionState: string;
}

// Error handling
export enum ErrorCode {
  // Connection errors
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  CONNECTION_TIMEOUT = 'CONNECTION_TIMEOUT',
  CONNECTION_LOST = 'CONNECTION_LOST',
  
  // Operation errors
  OPERATION_FAILED = 'OPERATION_FAILED',
  OPERATION_TIMEOUT = 'OPERATION_TIMEOUT',
  OPERATION_CANCELLED = 'OPERATION_CANCELLED',
  
  // Game errors
  INVALID_MOVE = 'INVALID_MOVE',
  INVALID_STATE = 'INVALID_STATE',
  GAME_NOT_FOUND = 'GAME_NOT_FOUND',
  GAME_FULL = 'GAME_FULL',
  
  // State errors
  STATE_VALIDATION_ERROR = 'STATE_VALIDATION_ERROR',
  STATE_TRANSITION_ERROR = 'STATE_TRANSITION_ERROR',
  
  // Storage errors
  STORAGE_ERROR = 'STORAGE_ERROR',
  
  // Unknown error
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface GameError {
  code: ErrorCode;
  message: string;
  severity: ErrorSeverity;
  details?: Record<string, unknown>;
  timestamp?: number;
  recoverable?: boolean;
  retryCount?: number;
}

export enum RecoveryStrategy {
  NOTIFY = 'NOTIFY',
  RETRY = 'RETRY',
  RECONNECT = 'RECONNECT',
  RESET = 'RESET',
  USER_ACTION = 'USER_ACTION'
}

export interface ErrorRecoveryConfig {
  maxRetries?: number;
  retryDelay?: number;
  useBackoff?: boolean;
  recover?: (error: GameError) => Promise<void>;
}

// Action types
export enum GameActionType {
  MAKE_MOVE = 'MAKE_MOVE',
  END_TURN = 'END_TURN',
  JOIN_GAME = 'JOIN_GAME',
  CREATE_GAME = 'CREATE_GAME',
  RECONNECT = 'RECONNECT'
}

export interface GameAction {
  type: GameActionType;
  timestamp: number;
  gameId?: string;
}

export interface MakeMoveAction extends GameAction {
  type: GameActionType.MAKE_MOVE;
  move: IGameMove;
}

export interface EndTurnAction extends GameAction {
  type: GameActionType.END_TURN;
}

export interface JoinGameAction extends GameAction {
  type: GameActionType.JOIN_GAME;
  gameId: string;
}

export interface CreateGameAction extends GameAction {
  type: GameActionType.CREATE_GAME;
}

export interface ReconnectAction extends GameAction {
  type: GameActionType.RECONNECT;
  gameId: string;
}

export type GameActionUnion = 
  | MakeMoveAction 
  | EndTurnAction 
  | JoinGameAction 
  | CreateGameAction
  | ReconnectAction;

// WebSocket types
export enum WebSocketEvents {
    // Client -> Server events
    CreateGame = 'createGame',
    JoinGame = 'joinGame',
    MakeMove = 'makeMove',
    EndTurn = 'endTurn',
    Disconnect = 'disconnect',
    Reconnect = 'reconnect',

    // Server -> Client events
    GameCreated = 'gameCreated',
    GameJoined = 'gameJoined',
    GameStarted = 'gameStarted',
    GameStateUpdated = 'gameStateUpdated',
    AvailableReplaces = 'availableReplaces',
    GameOver = 'gameOver',
    PlayerDisconnected = 'playerDisconnected',
    PlayerReconnected = 'playerReconnected',
    GameExpired = 'gameExpired',
    Error = 'error'
}

export interface WebSocketPayloads {
    // Client -> Server requests
    [WebSocketEvents.CreateGame]: void;
    [WebSocketEvents.JoinGame]: {
        gameId: string;
    };
    [WebSocketEvents.MakeMove]: {
        gameId: string;
        move: IGameMove;
    };
    [WebSocketEvents.EndTurn]: {
        gameId: string;
    };
    [WebSocketEvents.Disconnect]: void;

    // Server -> Client responses
    [WebSocketEvents.GameCreated]: {
        gameId: string;
        eventId: string;
    };
    [WebSocketEvents.GameJoined]: {
        gameId: string;
        eventId: string;
        phase: GamePhase;
    };
    [WebSocketEvents.GameStarted]: {
        gameState: IGameState;
        currentPlayer: number;
        eventId: string;
        phase: GamePhase;
    };
    [WebSocketEvents.GameStateUpdated]: {
        gameState: IGameState;
        currentPlayer: number;
        phase: GamePhase;
    };
    [WebSocketEvents.AvailableReplaces]: {
        moves: IGameMove[];
    };
    [WebSocketEvents.GameOver]: {
        gameState: IGameState;
        winner: number | null;
    };
    [WebSocketEvents.PlayerDisconnected]: {
        player: number;
    };
    [WebSocketEvents.Error]: {
        code: WebSocketErrorCode;
        message: string;
        details?: unknown;
    };
    [WebSocketEvents.Reconnect]: {
        gameId: string;
    };
    [WebSocketEvents.PlayerReconnected]: {
        gameState: IGameState;
        currentPlayer: number;
        playerNumber: number;
    };
    [WebSocketEvents.GameExpired]: {
        gameId: string;
        reason: string;
    };
}

export type ServerToClientEvents = {
    [K in WebSocketEvents as K extends keyof WebSocketPayloads ? K : never]: (
        payload: K extends keyof WebSocketPayloads ? WebSocketPayloads[K] : never
    ) => void;
};

export type ClientToServerEvents = {
    [K in WebSocketEvents as K extends keyof WebSocketPayloads ? K : never]: (
        payload: K extends keyof WebSocketPayloads ? WebSocketPayloads[K] : never
    ) => void;
};

// Replay types
export interface IReplayState {
    currentMoveIndex: number;  // Current move number
    totalMoves: number;        // Total number of moves
    isPlaying: boolean;        // Is replay active
    playbackSpeed: number;     // Playback speed (1 = normal)
    gameCode: string;         // Game code
}

export enum ReplayEvent {
    // Client -> Server
    START_REPLAY = 'START_REPLAY',
    PAUSE_REPLAY = 'PAUSE_REPLAY',
    RESUME_REPLAY = 'RESUME_REPLAY',
    NEXT_MOVE = 'NEXT_MOVE',
    PREV_MOVE = 'PREV_MOVE',
    GOTO_MOVE = 'GOTO_MOVE',
    SET_PLAYBACK_SPEED = 'SET_PLAYBACK_SPEED',
    END_REPLAY = 'END_REPLAY',

    // Server -> Client
    REPLAY_STATE_UPDATED = 'REPLAY_STATE_UPDATED',
    REPLAY_PAUSED = 'REPLAY_PAUSED',
    REPLAY_RESUMED = 'REPLAY_RESUMED',
    REPLAY_COMPLETED = 'REPLAY_COMPLETED',
    REPLAY_ERROR = 'REPLAY_ERROR',
    PLAYBACK_SPEED_UPDATED = 'PLAYBACK_SPEED_UPDATED'
}

export interface IReplayStateUpdate {
    state: IGameState;
    moveIndex: number;
    totalMoves: number;
}

export interface IReplayError {
    message: string;
}

export interface IPlaybackSpeedUpdate {
    speed: number;
}

// Redis types
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
    status: 'waiting' | 'playing' | 'finished';
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

// Event types
export enum GameEventType {
    MOVE = 'move',
    DISCONNECT = 'disconnect',
    RECONNECT = 'reconnect',
    END_TURN = 'end_turn'
}

export enum ConnectionState {
    CONNECTING = 'CONNECTING',
    CONNECTED = 'CONNECTED',
    DISCONNECTED = 'DISCONNECTED',
    RECONNECTING = 'RECONNECTING',
    ERROR = 'ERROR'
}

export enum GameErrorType {
    CONNECTION = 'CONNECTION',
    VALIDATION = 'VALIDATION',
    TIMEOUT = 'TIMEOUT',
    GAME_STATE = 'GAME_STATE',
    PLAYER_DISCONNECT = 'PLAYER_DISCONNECT',
    SERVER = 'SERVER'
}

export type GameEventError = {
    type: GameErrorType;
    message: string;
    recoverable: boolean;
    retryable: boolean;
    details?: Record<string, any>;
}

export enum WebSocketErrorCode {
    INVALID_GAME_ID = 'INVALID_GAME_ID',
    GAME_NOT_FOUND = 'GAME_NOT_FOUND',
    GAME_FULL = 'GAME_FULL',
    INVALID_MOVE = 'INVALID_MOVE',
    NOT_YOUR_TURN = 'NOT_YOUR_TURN',
    GAME_ENDED = 'GAME_ENDED',
    INVALID_STATE = 'INVALID_STATE',
    CONNECTION_ERROR = 'CONNECTION_ERROR',
    SERVER_ERROR = 'SERVER_ERROR',
    TIMEOUT = 'TIMEOUT'
}

export interface IGameEvent {
    type: GameEventType;
    gameId: string;
    playerId: string;
    data: Record<string, any>;
    timestamp: number;
}

export interface ReconnectionData {
    gameId: string;
    playerNumber: number;
    lastEventId?: string;
    timestamp: number;
}

export interface ErrorResponse {
    code: WebSocketErrorCode;
    message: string;
    details?: Record<string, any>;
}

// Storage types
export interface GameMetadata {
    gameId: string;           // Unique game identifier
    code: string;            // 4-digit connection code
    status: GameStatus;      // Game status
    startTime: string;       // ISO datetime
    endTime?: string;        // ISO datetime
    duration?: number;       // Game duration in seconds
    lastActivityAt: string;  // ISO datetime
    expiresAt: string;      // ISO datetime
    players: {
        first?: string;      // First player ID
        second?: string;     // Second player ID
    };
    winner?: Player;        // Winner (Player.First or Player.Second)
    finalScore?: IScores;    // Final scores using Player enum
    totalTurns: number;     // Total number of turns
    boardSize: {            // Board dimensions
        width: number;
        height: number;
    };
    currentState?: IGameState;  // Current game state
    isCompleted?: boolean;      // Game completion flag
    gameOver?: boolean;         // Game over flag
    scores?: IScores;          // Current scores using Player enum
    currentPlayer?: Player;     // Current player (First or Second)
}

export interface GameMove {
    player: Player;  // Player enum value
    x: number;
    y: number;
    timestamp: number;
    replacements?: Array<[number, number]>;
}

export interface GameDetails {
    moves: GameMove[];
    timing: {
        moveTimes: number[];
        avgMoveTime: number;
    };
    territoryHistory: Array<IScores>;
}

export interface GameHistory {
    metadata: GameMetadata;
    moves: GameMove[];
    details: GameDetails;
}

export type GameStatus = 'waiting' | 'playing' | 'finished';

// State storage types
export interface StorageConfig {
    /** Prefix for storage keys to avoid conflicts */
    prefix: string;
    /** Time-to-live in milliseconds for stored states */
    ttl: number;
    /** Version of the storage format */
    version: string;
}

export interface StoredState<T> {
    /** Version of the storage format */
    version: string;
    /** Timestamp when the state was saved */
    timestamp: number;
    /** The actual state data */
    data: T;
    /** When this state will expire */
    expiresAt: number;
}

export interface GameManagerState {
    phase: GamePhase;
    gameId: string | null;
    playerNumber: number | null;
    error: any | null;
    connectionState: string;
    lastUpdated: number;
}

export type MigrationStrategy = (oldState: any) => GameManagerState;

export interface MigrationConfig {
    version: string;
    migrate: MigrationStrategy;
}

export interface IStateStorage {
    /** Save state with key */
    saveState(key: string, state: any): void;
    
    /** Load state by key */
    loadState<T>(key: string): T | null;
    
    /** Remove expired states */
    cleanupExpired(): void;
    
    /** Remove state by key */
    removeState(key: string): void;
    
    /** Get all keys with prefix */
    getKeys(prefix?: string): string[];
}

// AI types
export interface IPositionStrength {
    /** Number of pieces the player has */
    pieces: number;
    /** Percentage of territory controlled (0-100) */
    territory: number;
    /** Influence score (0-100) */
    influence: number;
    /** Combined strength of connected groups */
    groupsStrength: number;
    /** Overall position evaluation */
    total: number;
}

export interface IMoveEvaluation {
    /** Position of the move */
    position: IPosition;
    /** Calculated score for the move */
    score: number;
    /** Individual evaluation components */
    components: {
        /** Territory control score */
        territory: number;
        /** Replacement potential score */
        replacement: number;
        /** Mobility score */
        mobility: number;
        /** Pattern-based score */
        pattern: number;
        /** Danger level */
        danger: number;
        /** Group formation score */
        group: number;
        /** Blocking value */
        block: number;
    };
}

export interface IAIConfig {
    /** Evaluation weights */
    weights: {
        /** Weight for territory control */
        territory: number;
        /** Weight for replacement potential */
        replacement: number;
        /** Weight for mobility */
        mobility: number;
        /** Weight for pattern matching */
        pattern: number;
        /** Weight for danger evaluation */
        danger: number;
        /** Weight for group formation */
        group: number;
        /** Weight for blocking moves */
        block: number;
    };
    /** Maximum calculation time in milliseconds */
    maxThinkTime?: number;
    /** Maximum search depth */
    maxDepth?: number;
    /** Whether to use advanced features */
    usePatternMatching?: boolean;
}

export interface IGameAI {
    /** Initialize AI with configuration */
    initialize(config: IAIConfig): void;
    /** Find best move in current position */
    findBestMove(state: IGameState): Promise<IMoveEvaluation>;
    /** Evaluate position strength */
    evaluatePosition(board: IBoard, player: number): IPositionStrength;
    /** Analyze specific position */
    analyzeMove(state: IGameState, position: IPosition): IMoveEvaluation;
}