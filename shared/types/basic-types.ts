// Most basic types that don't depend on anything else
export enum Player {
    None = 0,
    First = 1,
    Second = 2
}

export interface IPosition {
    x: number;
    y: number;
}

export interface IBoardSize {
    width: number;
    height: number;
}

export type GameStatus = 'waiting' | 'playing' | 'finished';