/**
 * Core primitive types
 */

// For backwards compatibility
export type IPhase = GamePhase;
export type IOperationType = MoveType;
export type IErrorCode = string;
export type IMessage = string;
export type IErrorDetails = Record<string, unknown>;
export type ITimestamp = Timestamp;
export type IConnectionStatus = ConnectionStatus;
export type IXCoordinate = number;
export type IYCoordinate = number;
export type IWidth = number;
export type IHeight = number;
export type IPlayerNumber = PlayerNumber;
export type IGameStatus = GameStatus;

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

/** Game state interface */
export interface IGameState {
    board: CellValue[][];
    scores: Scores;
    currentPlayer: PlayerNumber;
    status: GameStatus;
    winner?: PlayerNumber;
    lastMove?: GameMove;
    timestamp: number;
}
