// Game state types
export enum Player {
    None = 0,
    First = 1,
    Second = 2
}

export enum GameStatus {
    Waiting = 'waiting',
    Playing = 'playing',
    Finished = 'finished'
}

export interface Position {
    x: number;
    y: number;
}

export interface GameMove {
    player: Player;
    position: Position;
    timestamp: number;
}

export interface GameScore {
    [Player.First]: number;
    [Player.Second]: number;
}

export interface GameState {
    board: Player[][];
    currentPlayer: Player;
    status: GameStatus;
    moves: GameMove[];
    score: GameScore;
    winner: Player | null;
    opsRemaining: number;
}

// Game rules types
export interface MoveValidation {
    isValid: boolean;
    reason?: string;
}

export interface CaptureResult {
    positions: Position[];
    player: Player;
}

export interface MoveResult {
    isValid: boolean;
    captures: CaptureResult[];
    nextPlayer: Player;
    opsRemaining: number;
    isGameOver: boolean;
    winner: Player | null;
}