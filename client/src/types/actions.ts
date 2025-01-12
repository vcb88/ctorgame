export enum GameActionType {
  CREATE_GAME = 'CREATE_GAME',
  JOIN_GAME = 'JOIN_GAME',
  MAKE_MOVE = 'MAKE_MOVE',
  END_TURN = 'END_TURN',
  UNDO_MOVE = 'UNDO_MOVE'
}

export interface GameAction {
  type: GameActionType;
  payload?: any;
  timestamp: number;
  id: string;
}

export interface MoveAction extends GameAction {
  type: GameActionType.MAKE_MOVE;
  payload: {
    row: number;
    col: number;
    operationType: OperationType;
  };
}

export interface EndTurnAction extends GameAction {
  type: GameActionType.END_TURN;
}

export interface UndoMoveAction extends GameAction {
  type: GameActionType.UNDO_MOVE;
}

export type GameOperationAction = MoveAction | EndTurnAction | UndoMoveAction;