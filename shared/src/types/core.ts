/**
 * Core primitive types
 */

/** Position type [x, y] */
export type Position = [number, number];

/** Size type [width, height] */
export type Size = [number, number];

/** Player number (1 or 2) */
export type PlayerNumber = 1 | 2;

/** Score type [p1score, p2score] */
export type Scores = [number, number];

/** Basic timestamp */
export type Timestamp = number;

/** Basic validation result */
export type ValidationResult = {
    valid: boolean;
    message?: string;
};

/** Core game types */
/** Move type */
export type MoveType = 'place' | 'replace' | 'skip';

export type Player = {
    id: string;
    num: PlayerNumber;
    connected: boolean;
};

export type GameMove = {
    type: MoveType;
    pos?: Position;
};

/** Game cell value - can only be PlayerNumber or null */
export type CellValue = PlayerNumber | null;

/** Basic error type */
export type GameError = {
    code: string;
    message: string;
    details?: Record<string, unknown>;
};

/** Game connection status */
export type ConnectionStatus = 'connected' | 'disconnected' | 'error';

/** Game phase */
export type GamePhase = 'setup' | 'play' | 'end';

/** Game status */
export type GameStatus = 'waiting' | 'active' | 'finished';

/** Generic type for collections */
export type Collection<T> = ReadonlyArray<T>;

/** Generic type for data with metadata */
export type WithMetadata<T> = {
    data: T;
    timestamp: Timestamp;
    version?: string;
};
