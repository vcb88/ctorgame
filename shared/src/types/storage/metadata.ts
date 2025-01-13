import { Player } from '../base/enums.js';
import { GameStatus, IBoardSize } from '../primitives.js';
import { IGameState } from '../game/state.js';
import { GameMove } from '../game/moves.js';

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
