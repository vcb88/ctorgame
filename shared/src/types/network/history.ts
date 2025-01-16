import type { GameMove, GameState, PlayerNumber, Timestamp } from '../core.js';

export type HistoryClientEvents = {
    'request_history': (gameId: string) => void;
    'request_move': (gameId: string, moveIndex: number) => void;
};

export type HistoryServerEvents = {
    'history_loaded': (data: {
        moves: GameMove[];
        states: GameState[];
        timestamps: Timestamp[];
        winner?: PlayerNumber;
    }) => void;
    'move_loaded': (data: {
        move: GameMove;
        state: GameState;
        timestamp: Timestamp;
        index: number;
    }) => void;
};

export type GameHistoryEntry = {
    move: GameMove;
    state: GameState;
    timestamp: Timestamp;
    index: number;
};