import type { GameStatus } from '../game/types';
import type { IGameState, PlayerNumber, IGameMove, ISize, IGameScores } from '../game/types';

export interface GameDetails {
    moves: IGameMove[];
    timing: {
        moveTimes: number[];
        avgMoveTime: number;
    };
    territoryHistory: Array<{
        player1: number;
        player2: number;
    }>;
}

export interface GameMetadata {
    readonly gameId: string;
    readonly code: string;
    readonly status: GameStatus;
    readonly startTime: string;
    readonly endTime?: string;
    readonly duration?: number;
    readonly lastActivityAt: string;
    readonly expiresAt: string;
    readonly players: {
        readonly first?: string;
        readonly second?: string;
    };
    readonly winner?: PlayerNumber;
    readonly totalTurns: number;
    readonly currentState?: IGameState;
    readonly isCompleted?: boolean;
    readonly gameOver?: boolean;
    readonly currentPlayer?: PlayerNumber;
    readonly boardSize?: ISize;
    readonly finalScore?: IGameScores;
    readonly scores?: IGameScores;
}
