// Basic type definitions that don't depend on other types
export type Coordinate = number;
export type Size = number;
export type Timestamp = number;
export type Version = number;
export type UUID = string;
export type PlayerNumber = number;

// Basic interfaces
export interface IPosition {
    readonly x: Coordinate;
    readonly y: Coordinate;
}

export interface IBoardSize {
    readonly width: Size;
    readonly height: Size;
}

// Basic enums
export enum Player {
    None = 0,
    First = 1,
    Second = 2
}

