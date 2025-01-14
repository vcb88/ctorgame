import type { IGameState } from '../game/state.js';
import type { GameMove } from '../game/moves.js';
import { Player } from './enums.js';

export type ServerToClientEvents = {
  'game-created': (data: { gameId: string; eventId: string }) => void;
  'game-joined': (data: { gameId: string; eventId: string; phase: string }) => void;
  'game-started': (data: { gameState: IGameState; currentPlayer: number; eventId: string; phase: string }) => void;
  'game-state-updated': (data: { gameState: IGameState; currentPlayer: number; phase: string }) => void;
  'available-replaces': (data: { moves: GameMove[]; replacements: [number, number][] }) => void;
  'game-over': (data: { gameState: IGameState; winner: Player | null }) => void;
  'error': (data: { code: WebSocketErrorCode; message: string; details?: Record<string, unknown> }) => void;
};

export type ClientToServerEvents = {
  'create-game': () => void;
  'join-game': (data: { gameId: string }) => void;
  'make-move': (data: { gameId: string; move: GameMove }) => void;
  'end-turn': (data: { gameId: string }) => void;
  'reconnect': (data: { gameId: string }) => void;
};

export type ServerToClientEventType = keyof ServerToClientEvents;
export type ClientToServerEventType = keyof ClientToServerEvents;

export enum WebSocketEvents {
  CreateGame = 'create-game',
  GameCreated = 'game-created',
  JoinGame = 'join-game',
  GameJoined = 'game-joined',
  GameStarted = 'game-started',
  MakeMove = 'make-move',
  EndTurn = 'end-turn',
  GameStateUpdated = 'game-state-updated',
  AvailableReplaces = 'available-replaces',
  GameOver = 'game-over',
  Reconnect = 'reconnect',
  Error = 'error'
}

export enum WebSocketErrorCode {
  INVALID_GAME_ID = 'invalid_game_id',
  GAME_ENDED = 'game_ended',
  NOT_YOUR_TURN = 'not_your_turn',
  INVALID_STATE = 'invalid_state',
  SERVER_ERROR = 'server_error'
}