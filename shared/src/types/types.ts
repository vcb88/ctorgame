/** Basic coordinate types */
export type IXCoordinate = number;
export type IYCoordinate = number;

/** Size types */
export type IWidth = number;
export type IHeight = number;

/** Position type [x, y] */
export type Position = [IXCoordinate, IYCoordinate];
export type IPosition = Position;

/** Size type [width, height] */
export type Size = [IWidth, IHeight];

/** Basic timestamp */
export type Timestamp = number;
export type ITimestamp = Timestamp;

/** Player types */
export type PlayerNumber = 1 | 2;
export type IPlayerNumber = PlayerNumber;

/** Score type [p1score, p2score] */
export type Scores = [number, number];

/** Phase and status types */
export type GamePhase = 'setup' | 'play' | 'end';
export type IPhase = GamePhase;

export type GameStatus = 'waiting' | 'active' | 'finished';
export type IGameStatus = GameStatus;

/** Operation type */
export type MoveType = 'place' | 'replace' | 'skip';
export type IOperationType = MoveType;

/** Game cell value */
export type CellValue = PlayerNumber | null;

/** Connection status */
export type ConnectionStatus = 'connected' | 'disconnected' | 'error';
export type IConnectionStatus = ConnectionStatus;

/** Validation result */
export type ValidationResult = {
    valid: boolean;
    message?: string;
};
export type IValidationResult = ValidationResult;

/** Basic error types */
export type IErrorCode = string;
export type IMessage = string;
export type IErrorDetails = Record<string, unknown>;

export type GameError = {
    code: IErrorCode;
    message: IMessage;
    details?: IErrorDetails;
};

/** Player type */
export type Player = {
    id: string;
    num: PlayerNumber;
    connected: boolean;
};

/** Move types */
export type GameMove = {
    type: MoveType;
    pos?: Position;
};

/** Game state */
export interface IGameState {
    board: CellValue[][];
    scores: Scores;
    currentPlayer: PlayerNumber;
    status: GameStatus;
    winner?: PlayerNumber;
    lastMove?: GameMove;
    timestamp: number;
}

/** Generic types */
export type Collection<T> = ReadonlyArray<T>;

export type WithMetadata<T> = {
    data: T;
    timestamp: Timestamp;
    version?: string;
};

/** UUID type */
export type UUID = string;

/** Version type */
export type Version = string;

/** Complete move information */
export type GameMoveComplete = GameMove & {
    timestamp: number;
    gameId: string;
    moveNumber: number;
};

/** Game history entry */
export type GameHistoryEntry = {
    state: IGameState;
    move: GameMoveComplete;
};

/** Move validation */
export type MoveValidation = {
    valid: boolean;
    message?: string;
    captures?: Position[];
};