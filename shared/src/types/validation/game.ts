import { IPosition, IBoardSize } from '../base/primitives.js.js';
import { Player } from '../base/enums.js.js';
import { GameMove } from '../game/moves.js.js';
import { IGameState } from '../game/state.js.js';
import { IValidationResult } from './result.js.js';".js"

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
