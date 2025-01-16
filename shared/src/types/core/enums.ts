/**
 * Core enumerations
 */

/** Game phase */
export enum GamePhaseEnum {
    SETUP = 'setup',
    PLAY = 'play',
    END = 'end'
}

/** Game status */
export enum GameStatusEnum {
    WAITING = 'waiting',
    ACTIVE = 'active',
    FINISHED = 'finished'
}

/** Move type */
export enum MoveTypeEnum {
    PLACE = 'place',
    REPLACE = 'replace',
    SKIP = 'skip'
}

/** Player connection status */
export enum ConnectionStatusEnum {
    CONNECTED = 'connected',
    DISCONNECTED = 'disconnected',
    ERROR = 'error'
}