import { Player, IPosition, GameStatus } from './base';
import { IGameState } from './state';

export interface IPlayer {
    id: string;
    number: Player;
}

export interface IGameRoom {
    gameId: string;
    players: IPlayer[];
    currentState: IGameState;
    currentPlayer: Player;
}

export interface GameMove {
    player: Player;
    x: number;
    y: number;
    timestamp: number;
    replacements?: Array<[number, number]>;
}

export interface GameDetails {
    moves: GameMove[];
    timing: {
        moveTimes: number[];
        avgMoveTime: number;
    };
    territoryHistory: Array<{
        [Player.First]: number;
        [Player.Second]: number;
    }>;
}

export interface GameMetadata {
    gameId: string;
    code: string;
    status: GameStatus;
    startTime: string;
    endTime?: string;
    duration?: number;
    lastActivityAt: string;
    expiresAt: string;
    players: {
        first?: string;
        second?: string;
    };
    winner?: Player;
    totalTurns: number;
    currentState?: IGameState;
    isCompleted?: boolean;
    gameOver?: boolean;
    currentPlayer?: Player;
}