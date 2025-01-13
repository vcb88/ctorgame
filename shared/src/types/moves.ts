import { Player, IPosition } from './basic-types';

// Base move type interfaces
export interface IMoveTypeBase {
    readonly type: 'place' | 'replace' | 'end_turn';
}

export interface IMovePositionBase {
    readonly position: IPosition;
}

export interface IBasicMoveBase extends IMoveTypeBase, IMovePositionBase {}

export interface IBasicMove extends IBasicMoveBase {}

// Server move interfaces
export interface IServerMoveBase extends IBasicMoveBase {
    readonly replacements?: ReadonlyArray<[number, number]>;
}

export interface IServerMove extends IServerMoveBase {}

// Game move interfaces
export interface IGameMoveBase extends IServerMoveBase {
    readonly player: Player;
}

export interface GameMove extends IGameMoveBase {
    readonly timestamp: number;
}

// Validation interfaces
export interface IReplaceValidationBase {
    readonly valid: boolean;
    readonly message?: string;
}

export interface IReplaceValidation extends IReplaceValidationBase {
    readonly replacements?: ReadonlyArray<[number, number]>;
}