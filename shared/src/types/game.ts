import type { Player, PlayerNumber, Timestamp, GameState } from './core.js';

export type Player = {
    id: string;
    num: PlayerNumber;
    connected: boolean;
};

export type GameRoom = {
    gameId: string;
    players: Player[];
    currentState: GameState;
    currentPlayer: Player;
};

export type GameSummary = {
    gameId: string;
    players: Player[];
    startTime: Timestamp;
    endTime?: Timestamp;
    winner?: PlayerNumber;
};