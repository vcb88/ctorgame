import type { GameMove, GameState, PlayerNumber, Timestamp } from '../core.js';

export type ReplayState = {
    paused: boolean;
    speed: number;
    currentMove: number;
    totalMoves: number;
};

export type ReplayClientEvents = {
    'start_replay': (gameId: string) => void;
    'pause_replay': () => void;
    'resume_replay': () => void;
    'next_move': () => void;
    'prev_move': () => void;
    'goto_move': (moveIndex: number) => void;
    'set_speed': (speed: number) => void;
};

export type ReplayServerEvents = {
    'replay_state_updated': (data: {
        state: GameState;
        moveIndex: number;
        totalMoves: number;
    }) => void;
    'replay_started': (data: {
        initialState: GameState;
        totalMoves: number;
    }) => void;
    'replay_ended': (data: {
        finalState: GameState;
        winner?: PlayerNumber;
    }) => void;
};

export type GameHistoryEntry = {
    move: GameMove;
    state: GameState;
    timestamp: Timestamp;
    index: number;
};