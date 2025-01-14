/**
 * Game action types and interfaces
 */
import type { IGameMove } from './types.js';
import type { GameActionType } from './types.js';

/** Base interface for all game actions */
export interface IGameAction {
    readonly type: GameActionType;
    readonly timestamp: number;
}

/** Create game action */
export interface ICreateGameAction extends IGameAction {
    readonly type: 'CREATE_GAME';
}

/** Join game action */
export interface IJoinGameAction extends IGameAction {
    readonly type: 'JOIN_GAME';
    readonly gameId: string;
}

/** Make move action */
export interface IMakeMoveAction extends IGameAction {
    readonly type: 'MAKE_MOVE';
    readonly gameId: string;
    readonly move: IGameMove;
}

/** End turn action */
export interface IEndTurnAction extends IGameAction {
    readonly type: 'END_TURN';
    readonly gameId: string;
}

/** Union type for all game actions */
export type GameAction = 
    | ICreateGameAction
    | IJoinGameAction
    | IMakeMoveAction
    | IEndTurnAction;