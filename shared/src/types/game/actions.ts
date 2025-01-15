/**
 * Game action types and interfaces
 */
import type { IGameMove } from './types.js';
import type { Timestamp } from '../core.js';

// Action type literals
export type GameActionType = 'CREATE_GAME' | 'JOIN_GAME' | 'MAKE_MOVE' | 'END_TURN';

/** Base type for all game actions */
export type GameActionBase = {
    readonly type: GameActionType;
    readonly timestamp: Timestamp;
};

/** Create game action */
export type CreateGameAction = GameActionBase & {
    readonly type: 'CREATE_GAME';
};

/** Join game action */
export type JoinGameAction = GameActionBase & {
    readonly type: 'JOIN_GAME';
    readonly gameId: string;
};

/** Make move action */
export type MakeMoveAction = GameActionBase & {
    readonly type: 'MAKE_MOVE';
    readonly gameId: string;
    readonly move: IGameMove;
};

/** End turn action */
export type EndTurnAction = GameActionBase & {
    readonly type: 'END_TURN';
    readonly gameId: string;
};

/** Union type for all game actions */
export type GameAction = 
    | CreateGameAction
    | JoinGameAction
    | MakeMoveAction
    | EndTurnAction;

// Re-export old interface names for backwards compatibility
export type IGameAction = GameActionBase;
export type ICreateGameAction = CreateGameAction;
export type IJoinGameAction = JoinGameAction;
export type IMakeMoveAction = MakeMoveAction;
export type IEndTurnAction = EndTurnAction;