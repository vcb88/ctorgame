import {
    IOperationType,
    IValidationResult,
    ITimestamp
} from '../core.js.js';
import { IPositionBase } from '../base/primitives.js.js';
import { Player } from '../base/enums.js.js';

// Move interfaces
export interface IMoveBase extends IOperationType {
    readonly type: 'place' | 'replace' | 'end_turn';
}

export interface IPositionedMoveBase extends IMoveBase {
    readonly position: IPositionBase;
}

export interface IBasicMove extends IPositionedMoveBase {}

// Server move interfaces
export interface IServerMoveBase extends IBasicMove {
    readonly replacements?: ReadonlyArray<[number, number]>;
}

export interface IServerMove extends IServerMoveBase {}

// Game move interfaces
export interface IGameMoveBase extends IServerMoveBase {
    readonly player: Player;
}

export interface GameMove extends IGameMoveBase, ITimestamp {}

// Replace validation interfaces
export interface IReplaceValidationBase extends IValidationResult {
    readonly replacements?: ReadonlyArray<[number, number]>;
