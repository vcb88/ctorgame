// Most basic types that don't depend on anything else
export enum Player {
    None = 0,
    First = 1,
    Second = 2
}

// Base interfaces for positions and coordinates
export interface IPositionBase {
    x: number;
    y: number;
}

export interface IPosition extends IPositionBase {}

// Base interfaces for board structure
export interface IBoardSizeBase {
    width: number;
    height: number;
}

export interface IBoardSize extends IBoardSizeBase {}

// Base interfaces for game status
export interface IGameStatusBase {
    status: 'waiting' | 'playing' | 'finished';
}

export type GameStatus = IGameStatusBase['status'];

// Base interfaces for player-related types
export interface IPlayerBase {
    readonly player: Player;
}

export interface IPlayerIdentity extends IPlayerBase {
    readonly name?: string;
}