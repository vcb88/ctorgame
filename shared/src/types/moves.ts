import {
    IOperationType,
    IValidationResult,
    ITimestamp
} from './core';
import { IPositionBase } from './basic-types';
import { Player } from './basic-types';

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
}