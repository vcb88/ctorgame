// ============================================================================
// 1. BASIC TYPES
// ============================================================================

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

// Basic error types
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

// ============================================================================
// 2. GAME TYPES
// ============================================================================

export interface IBoard {
    cells: (number | null)[][];
    size: IBoardSize;
}

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

// ============================================================================
// 3. ACTION AND EVENT TYPES
// ============================================================================

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

// WebSocket events and payloads
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

export enum ConnectionState {
    CONNECTING = 'CONNECTING',
    CONNECTED = 'CONNECTED',
    DISCONNECTED = 'DISCONNECTED',
    RECONNECTING = 'RECONNECTING',
    ERROR = 'ERROR'
}

export interface ErrorResponse {
    code: WebSocketErrorCode;
    message: string;
    details?: Record<string, any>;
}

// ============================================================================
// 4. STATE MANAGEMENT TYPES
// ============================================================================

export interface GameManagerState {
    phase: GamePhase;
    gameId: string | null;
    playerNumber: Player | null;
    error: Error | null;
    connectionState: string;
    lastUpdated: number;
}

export interface StoredState<T> {
    version: string;
    timestamp: number;
    data: T;
    expiresAt: number;
}

export type MigrationStrategy = (oldState: any) => GameManagerState;

export interface MigrationConfig {
    version: string;
    migrate: MigrationStrategy;
}

export interface IStateStorage {
    saveState(key: string, state: any): void;
    loadState<T>(key: string): T | null;
    cleanupExpired(): void;
    removeState(key: string): void;
    getKeys(prefix?: string): string[];
}

// Replay types
export interface IReplayState {
    currentMoveIndex: number;
    totalMoves: number;
    isPlaying: boolean;
    playbackSpeed: number;
    gameCode: string;
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

// ============================================================================
// 5. STORAGE TYPES
// ============================================================================

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

export interface ICacheConfig {
    ttl: {
        gameState: number;
        playerSession: number;
        gameRoom: number;
    };
}

export type GameStatus = 'waiting' | 'playing' | 'finished';

export interface GameMetadata {
    gameId: string;
    code: string;
    status: GameStatus;
    startTime: string;
    endTime?: string;
    duration?: number;
    lastActivityAt: string;
    expiresAt: string;
    players: {
        first?: string;
        second?: string;
    };
    winner?: Player;
    finalScore?: IScores;
    totalTurns: number;
    boardSize: IBoardSize;
    currentState?: IGameState;
    isCompleted?: boolean;
    gameOver?: boolean;
    scores?: IScores;
    currentPlayer?: Player;
}

export interface GameMove {
    player: Player;
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

export interface StorageConfig {
    prefix: string;
    ttl: number;
    version: string;
}

// ============================================================================
// 6. AI TYPES
// ============================================================================

export interface IPositionStrength {
    pieces: number;
    territory: number;
    influence: number;
    groupsStrength: number;
    total: number;
}

export interface IMoveEvaluation {
    position: IPosition;
    score: number;
    components: {
        territory: number;
        replacement: number;
        mobility: number;
        pattern: number;
        danger: number;
        group: number;
        block: number;
    };
}

export interface IAIConfig {
    weights: {
        territory: number;
        replacement: number;
        mobility: number;
        pattern: number;
        danger: number;
        group: number;
        block: number;
    };
    maxThinkTime?: number;
    maxDepth?: number;
    usePatternMatching?: boolean;
}

export interface IGameAI {
    initialize(config: IAIConfig): void;
    findBestMove(state: IGameState): Promise<IMoveEvaluation>;
    evaluatePosition(board: IBoard, player: number): IPositionStrength;
    analyzeMove(state: IGameState, position: IPosition): IMoveEvaluation;
}

// Necessary type definitions needed by other types
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