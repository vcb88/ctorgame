// Basic interfaces
export interface INumeric {
    value: number;
}

export interface ITimestamp {
    timestamp: number;
}

export interface IIdentifiable {
    id: string;
}

export interface IVersioned {
    version: string;
}

export interface IValid {
    valid: boolean;
}

export interface IMessage {
    message: string;
}

// Basic coordinate interfaces
export interface IPosition {
    x: number;
    y: number;
}

// Basic dimension interfaces
export interface IBoardSize {
    width: number;
    height: number;
}

// Basic game status
export type GameStatus = 'waiting' | 'playing' | 'finished';

// Basic operation types
export type OperationType = 'place' | 'replace';

// Basic move interface
export interface IGameMove {
    type: OperationType;
    position: IPosition;
}

// Basic game state
export interface IGameState {
    board: number[][];
    currentPlayer: number;
    status: GameStatus;
    scores: {
        player1: number;
        player2: number;
    };
}