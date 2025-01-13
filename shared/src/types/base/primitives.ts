import {
    IXCoordinate,
    IYCoordinate,
    IWidth,
    IHeight,
    IGameStatus
} from '../core';

export interface IPositionBase extends IXCoordinate, IYCoordinate {}
export interface IPosition extends IPositionBase {}

export interface IBoardSizeBase extends IWidth, IHeight {}
export interface IBoardSize extends IBoardSizeBase {}

export interface IGameStatusBase extends IGameStatus {}
export type GameStatus = 'waiting' | 'playing' | 'finished';