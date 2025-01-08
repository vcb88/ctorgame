// Re-export validation utilities
export * from '../validation/game';

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
}

export interface IGameState {
  board: IBoard;
  gameOver: boolean;
  winner: number | null;
  currentTurn: ITurnState;
  currentPlayer: number;
  scores: IScores;
  isFirstTurn: boolean;
}

export interface IReplaceValidation {
  isValid: boolean;
  adjacentCount: number;
  positions: IPosition[];
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
  };
  [WebSocketEvents.GameJoined]: {
    gameId: string;
  };
  [WebSocketEvents.GameStarted]: {
    gameState: IGameState;
    currentPlayer: number;
  };
  [WebSocketEvents.GameStateUpdated]: {
    gameState: IGameState;
    currentPlayer: number;
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
    message: string;
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

export const getAdjacentPositions = (pos: IPosition, board: IBoard): IPosition[] => {
  return DIRECTIONS.map(([dx, dy]) => ({
    x: ((pos.x + dx + board.size.width) % board.size.width),
    y: ((pos.y + dy + board.size.height) % board.size.height)
  }));
};