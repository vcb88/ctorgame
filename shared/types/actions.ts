import { IGameMove } from './index.js';

/**
 * Types of game actions
 */
export enum GameActionType {
  MAKE_MOVE = 'MAKE_MOVE',
  END_TURN = 'END_TURN',
  JOIN_GAME = 'JOIN_GAME',
  CREATE_GAME = 'CREATE_GAME',
  RECONNECT = 'RECONNECT'
}

/**
 * Base action interface
 */
export interface GameAction {
  type: GameActionType;
  timestamp: number;
  gameId?: string;
}

/**
 * Move action
 */
export interface MakeMoveAction extends GameAction {
  type: GameActionType.MAKE_MOVE;
  move: IGameMove;
}

/**
 * End turn action
 */
export interface EndTurnAction extends GameAction {
  type: GameActionType.END_TURN;
}

/**
 * Join game action
 */
export interface JoinGameAction extends GameAction {
  type: GameActionType.JOIN_GAME;
  gameId: string;
}

/**
 * Create game action
 */
export interface CreateGameAction extends GameAction {
  type: GameActionType.CREATE_GAME;
}

/**
 * Reconnect action
 */
export interface ReconnectAction extends GameAction {
  type: GameActionType.RECONNECT;
  gameId: string;
}

/**
 * Union type of all game actions
 */
export type GameActionUnion = 
  | MakeMoveAction 
  | EndTurnAction 
  | JoinGameAction 
  | CreateGameAction
  | ReconnectAction;