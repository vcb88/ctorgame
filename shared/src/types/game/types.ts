/**
 * Game domain types
 */

import { Position } from '../common/index.js';
import { GameStatusEnum, PlayerNumberEnum, CellValueEnum, PlayerActionEnum } from './enums.js';

export interface Player {
    readonly id: string;
    readonly number: PlayerNumberEnum;
    readonly connected: boolean;
}

export interface GameState {
    readonly id: string;
    readonly status: GameStatusEnum;
    readonly board: readonly (readonly CellValueEnum[])[];
    readonly currentPlayer: PlayerNumberEnum;
    readonly players: readonly Player[];
    readonly scores: readonly [number, number];
    readonly lastMoveTimestamp: number;
    readonly lastAction?: GameAction;
    readonly replacements?: ReadonlyArray<[number, number]>;
}

export interface GameMove {
    readonly player: PlayerNumberEnum;
    readonly position: Position;
    readonly timestamp: number;
}

export interface GameAction {
    readonly type: PlayerActionEnum;
    readonly player: PlayerNumberEnum;
    readonly timestamp: number;
    readonly position?: Position;
    readonly replacements?: ReadonlyArray<[number, number]>;
}

export interface GameRoom {
    readonly gameId: string;
    readonly players: readonly Player[];
    readonly currentState: GameState;
    readonly currentPlayer: PlayerNumberEnum;
    readonly lastUpdateTime: number;
}