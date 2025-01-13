import {
    IXCoordinate,
    IYCoordinate,
    IWidth,
    IHeight,
    IPlayerNumber,
    IGameStatus
} from './core';

// Player enum and interfaces
export enum Player {
    None = 0,
    First = 1,
    Second = 2
}

export interface IPlayerBase extends IPlayerNumber {
    readonly player: Player;
}

// Position interfaces
export interface IPositionBase extends IXCoordinate, IYCoordinate {}

export interface IPosition extends IPositionBase {}

// Board size interfaces
export interface IBoardSizeBase extends IWidth, IHeight {}

export interface IBoardSize extends IBoardSizeBase {}

// Game status interfaces
export interface IGameStatusBase extends IGameStatus {}

export type GameStatus = 'waiting' | 'playing' | 'finished';