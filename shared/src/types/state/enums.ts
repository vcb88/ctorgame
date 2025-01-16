/**
 * State related enumerations
 */

/** Game state phases */
export enum StatePhaseEnum {
    SETUP = 'setup',
    TURN = 'turn',
    END = 'end'
}

/** Move operation types */
export enum MoveOperationEnum {
    PLACE = 'place',
    REPLACE = 'replace',
    SKIP = 'skip'
}

/** Game board cell states */
export enum CellStateEnum {
    EMPTY = 0,
    PLAYER_1 = 1,
    PLAYER_2 = 2,
    BLOCKED = -1
}

/** State persistence modes */
export enum StatePersistenceEnum {
    MEMORY = 'memory',
    LOCAL = 'local',
    REMOTE = 'remote',
    HYBRID = 'hybrid'
}

/** State validation levels */
export enum StateValidationEnum {
    NONE = 'none',
    BASIC = 'basic',
    STRICT = 'strict'
}