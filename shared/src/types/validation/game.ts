import { IPosition, IBoardSize } from '../base/primitives';
import { Player } from '../base/enums';
import { GameMove } from '../game/moves';
import { IGameState } from '../game/state';
import { IValidationResult } from './result';

export interface IGameMoveValidation extends IValidationResult {
    move: GameMove;
}

export interface IBoardValidation extends IValidationResult {
    position: IPosition;
    size: IBoardSize;
}

export interface IStateValidation extends IValidationResult {
    state: IGameState;
    player: Player;
}

// Re-export game-related types needed for validation
export type {
    IPosition,
    IBoardSize,
    GameMove,
    IGameState,
    Player
};