import { Player, GameStatus, IBoardSize } from './base';
import { IGameState } from './state';
import { GameMove } from './moves';

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
    boardSize?: IBoardSize;
    finalScore?: {
        [Player.First]: number;
        [Player.Second]: number;
    };
    scores?: {
        [Player.First]: number;
        [Player.Second]: number;
    };
}