// Game phase states
export enum GamePhase {
    INITIAL = 'INITIAL',
    CONNECTING = 'CONNECTING',
    WAITING = 'WAITING',
    PLAYING = 'PLAYING',
    GAME_OVER = 'GAME_OVER'
}

// Player identifiers
export enum Player {
    Empty = 0,
    None = 0,
    First = 1,
    Second = 2
}

// Game outcome
export enum GameOutcome {
    Win = 'win',
    Loss = 'loss',
    Draw = 'draw'
}

// Error types
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

export type ConnectionState = 'connected' | 'disconnected' | 'connecting';

export interface GameError {
    code: ErrorCode;
    message: string;
    details?: unknown;
}

// Board and coordinate types
export interface IPosition {
    x: number;
    y: number;
}

export interface IBoardSize {
    width: number;
    height: number;
}

export interface IBoard {
    cells: number[][];
    size: IBoardSize;
}

// Game constants
export const BOARD_SIZE = 10;
export const MIN_ADJACENT_FOR_REPLACE = 5;
export const MAX_PLACE_OPERATIONS = 2;

// Game operation types
export enum OperationType {
    PLACE = 'place',
    REPLACE = 'replace',
    END_TURN = 'end_turn'
}

export interface IGameMove {
    type: OperationType;
    position: IPosition;
}

export interface ITurnState {
    placeOperationsLeft: number;
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
    currentPlayer: number;
    scores: IScores;
    isFirstTurn: boolean;
}

// Helper functions
export const getGameOutcome = (winner: Player | null, playerNumber: Player): GameOutcome => {
    if (winner === null) return GameOutcome.Draw;
    return winner === playerNumber ? GameOutcome.Win : GameOutcome.Loss;
};

export const getOpponent = (player: Player): Player => {
    switch (player) {
        case Player.First:
            return Player.Second;
        case Player.Second:
            return Player.First;
        default:
            return Player.Empty;
    }
};

export const DIRECTIONS = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],          [0, 1],
    [1, -1],  [1, 0],  [1, 1]
] as const;

export const getAdjacentPositions = (pos: IPosition, board: IBoard): IPosition[] => {
    return DIRECTIONS.map(([dx, dy]) => ({
        x: ((pos.x + dx + board.size.width) % board.size.width),
        y: ((pos.y + dy + board.size.height) % board.size.height)
    }));
};

// Re-export validation utilities
export * from './validation/game';
export * from './types/connection';

export interface GameManagerState {
  phase: GamePhase;
  gameId: string | null;
  playerNumber: Player | null;
  error: GameError | null;
  connectionState: ConnectionState;
}

export interface GameStateUpdate {
  gameState: IGameState;
  eventId: string;
  phase: GamePhase;
}

export enum Player {
  Empty = 0,
  None = 0, // синоним для Empty для обратной совместимости
  First = 1,
  Second = 2
}

export enum GameOutcome {
  Win = 'win',
  Loss = 'loss',
  Draw = 'draw'
}

export const getGameOutcome = (winner: Player | null, playerNumber: Player): GameOutcome => {
  if (winner === null) return GameOutcome.Draw;
  return winner === playerNumber ? GameOutcome.Win : GameOutcome.Loss;
};

export const getOpponent = (player: Player): Player => {
  switch (player) {
    case Player.First:
      return Player.Second;
    case Player.Second:
      return Player.First;
    default:
      return Player.Empty;
  }
};

// Coordinates and Board types
export interface IPosition {
  x: number;
  y: number;
}

export interface IBoardSize {
  width: number;
  height: number;
}

export interface IBoard {
  cells: number[][];
  size: IBoardSize;
}

// Game constants and types
export const BOARD_SIZE = 10;
export const MIN_ADJACENT_FOR_REPLACE = 5;
export const MAX_PLACE_OPERATIONS = 2;

export enum OperationType {
  PLACE = 'place',
  REPLACE = 'replace',
  END_TURN = 'end_turn'
}

export interface IGameMove {
  type: OperationType;
  position: IPosition;
}

export interface ITurnState {
  placeOperationsLeft: number;
  moves: IGameMove[];
}

export interface IScores {
  player1: number;
  player2: number;
  [Player.First]: number;
  [Player.Second]: number;
}

export type LegacyScores = { [Player.First]: number; [Player.Second]: number };

export const legacyToScores = (legacy: LegacyScores): IScores => ({
  player1: legacy[Player.First],
  player2: legacy[Player.Second],
  [Player.First]: legacy[Player.First],
  [Player.Second]: legacy[Player.Second]
});

export const createScores = (firstPlayer: number, secondPlayer: number): IScores => ({
  player1: firstPlayer,
  player2: secondPlayer,
  [Player.First]: firstPlayer,
  [Player.Second]: secondPlayer
});

export interface IGameState {
  board: IBoard;
  gameOver: boolean;
  winner: Player | null;
  currentTurn: ITurnState;
  currentPlayer: number;
  scores: IScores;
  isFirstTurn: boolean;
}

export interface IReplaceValidation {
  position: IPosition;
  isValid: boolean;
  adjacentCount: number;
  adjacentPositions: IPosition[];
}

export interface ReplaceCandidate {
  /** Position of the cell to be replaced */
  position: IPosition;
  /** Whether the replacement is valid */
  isValid: boolean;
  /** Number of adjacent pieces that make this replacement possible */
  adjacentCount: number;
  /** List of positions that contribute to this replacement */
  adjacentPositions: IPosition[];
  /** Calculated priority for this replacement (higher means more important) */
  priority: number;
}

// Player types
export interface IPlayer {
  id: string;
  number: number;
}

export interface IGameRoom {
  gameId: string;
  players: IPlayer[];
  currentState: IGameState;
  currentPlayer: number;
}

// WebSocket types
export enum GameActionType {
  CREATE_GAME = 'CREATE_GAME',
  JOIN_GAME = 'JOIN_GAME',
  MAKE_MOVE = 'MAKE_MOVE',
  END_TURN = 'END_TURN'
}

export enum WebSocketEvents {
  // Client to server events
  CreateGame = 'createGame',
  JoinGame = 'joinGame',
  MakeMove = 'makeMove',
  EndTurn = 'endTurn',
  Disconnect = 'disconnect',
  Reconnect = 'reconnect',

  // Server to client events
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
  // Client to server payloads
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

  // Server to client payloads
  [WebSocketEvents.GameCreated]: {
    gameId: string;
    eventId: string;
  };
  [WebSocketEvents.GameJoined]: {
    gameId: string;
    eventId: string;
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

// Helper types for Socket.IO typing
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

export enum GameEventType {
  Move = 'move',
  Disconnect = 'disconnect',
  Reconnect = 'reconnect',
  EndTurn = 'end_turn'
}

export interface IBaseGameEvent {
  type: GameEventType;
  gameId: string;
  playerId: string;
  timestamp: number;
}

export interface IGameEvent extends IBaseGameEvent {
  data?: unknown;
}

export interface IRedisGameEvent extends IBaseGameEvent {
  data: unknown; // В Redis версии data всегда должно быть определено
}

export interface ICacheConfig {
  ttl: {
    gameState: number;
    playerSession: number;
    gameRoom: number;
  };
}

// Storage types
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
  winner?: number;
  finalScore?: {
    player1: number;
    player2: number;
  };
  totalTurns: number;
  boardSize: {
    width: number;
    height: number;
  };
  currentState?: IGameState;
  isCompleted?: boolean;
  gameOver?: boolean;
  scores?: {
    player1: number;
    player2: number;
  };
  currentPlayer?: number;
}

export interface GameMove {
  player: number;
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
  territoryHistory: Array<{
    player1: number;
    player2: number;
  }>;
}

export interface GameHistory {
  metadata: GameMetadata;
  moves: GameMove[];
  details: GameDetails;
}

export type GameStatus = 'waiting' | 'playing' | 'finished';

// Replay types
export interface IReplayState {
  currentMoveIndex: number;
  totalMoves: number;
  isPlaying: boolean;
  playbackSpeed: number;
  gameCode: string;
}

export enum ReplayEvent {
  // Client to server
  START_REPLAY = 'START_REPLAY',
  PAUSE_REPLAY = 'PAUSE_REPLAY',
  RESUME_REPLAY = 'RESUME_REPLAY',
  NEXT_MOVE = 'NEXT_MOVE',
  PREV_MOVE = 'PREV_MOVE',
  GOTO_MOVE = 'GOTO_MOVE',
  SET_PLAYBACK_SPEED = 'SET_PLAYBACK_SPEED',
  END_REPLAY = 'END_REPLAY',

  // Server to client
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

// Coordinate transformation utilities
export function positionToRowCol(pos: IPosition): { row: number; col: number } {
  return { row: pos.y, col: pos.x };
}

export function rowColToPosition(row: number, col: number): IPosition {
  return { x: col, y: row };
}

export function normalizePosition(pos: IPosition, size: IBoardSize): IPosition {
  return {
    x: ((pos.x % size.width) + size.width) % size.width,
    y: ((pos.y % size.height) + size.height) % size.height
  };
}

// Board utility constants and functions
export const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],          [0, 1],
  [1, -1],  [1, 0],  [1, 1]
] as const;

export const isValidScores = (scores: unknown): scores is IScores => {
  if (!scores || typeof scores !== 'object') return false;
  
  const s = scores as Record<string | number, unknown>;
  return (
    (typeof s.player1 === 'number' && typeof s.player2 === 'number') ||
    (typeof s[Player.First] === 'number' && typeof s[Player.Second] === 'number')
  );
};

export const isValidGamePhase = (phase: unknown): phase is GamePhase => {
  return typeof phase === 'string' && ['INITIAL', 'CONNECTING', 'WAITING', 'PLAYING', 'GAME_OVER'].includes(phase);
};

export const isValidGameManagerState = (state: unknown): state is GameManagerState => {
  if (!state || typeof state !== 'object') return false;
  
  const s = state as Partial<GameManagerState>;
  return (
    isValidGamePhase(s.phase) &&
    (s.gameId === null || typeof s.gameId === 'string') &&
    (s.playerNumber === null || Object.values(Player).includes(s.playerNumber)) &&
    (s.error === null || (typeof s.error === 'object' && s.error !== null)) &&
    typeof s.connectionState === 'string'
  );
};

export const getAdjacentPositions = (pos: IPosition, board: IBoard): IPosition[] => {
  return DIRECTIONS.map(([dx, dy]) => ({
    x: ((pos.x + dx + board.size.width) % board.size.width),
    y: ((pos.y + dy + board.size.height) % board.size.height)
  }));
};