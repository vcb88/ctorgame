import type { GameMove, PlayerNumber } from '@ctor-game/shared/src/types/core.js';

export type GameActionType = 'move' | 'endTurn' | 'undoMove';

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