import type { GameMove, GameState, PlayerNumber, Timestamp, UUID } from '../core.js';

export type GameHistory = {
    gameId: UUID;
    moves: GameMove[];
    states: GameState[];
    timestamps: Timestamp[];
    winner?: PlayerNumber;
};

export type GameHistorySummary = {
    gameId: UUID;
    startTime: Timestamp;
    endTime?: Timestamp;
    moveCount: number;
    winner?: PlayerNumber;
};