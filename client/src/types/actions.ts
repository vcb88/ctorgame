import type { GameMove, PlayerNumber } from '@ctor-game/shared/types/core.js';

export enum GameActionType {
    MOVE = 'move',
    END_TURN = 'endTurn',
    UNDO_MOVE = 'undoMove',
    MAKE_MOVE = 'MAKE_MOVE'
}

export type GameAction = {
    type: GameActionType;
    player: PlayerNumber;
    timestamp: number;
};

export type MoveAction = GameAction & {
    type: 'move';
    move: GameMove;
};

export type EndTurnAction = GameAction & {
    type: 'endTurn';
};

export type UndoMoveAction = GameAction & {
    type: 'undoMove';
    moveIndex: number;
};

export type GameOperationAction = MoveAction | EndTurnAction | UndoMoveAction;

export enum GameOperationType {
    PLACE = 'PLACE',
    CAPTURE = 'CAPTURE',
    MOVE = 'MOVE'
}

export enum OperationType {
    CONNECT = 'CONNECT',
    DISCONNECT = 'DISCONNECT',
    START = 'START',
    END = 'END'
}