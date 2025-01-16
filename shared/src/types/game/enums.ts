/**
 * Game-related enumerations
 */

export enum GameStatusEnum {
    WAITING = 'waiting',
    PLAYING = 'playing',
    FINISHED = 'finished'
}

export enum PlayerActionEnum {
    MOVE = 'move',
    REPLACE = 'replace',
    SURRENDER = 'surrender'
}

export enum CellValueEnum {
    EMPTY = 0,
    PLAYER_1 = 1,
    PLAYER_2 = 2
}

export enum PlayerNumberEnum {
    ONE = 1,
    TWO = 2
}