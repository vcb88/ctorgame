import { GameState, PlayerType } from './index';

export type GameStatus = 'waiting' | 'playing' | 'finished';
export type PlayerRole = 'first' | 'second';

export interface GameRoom {
    id: string;
    code: string;
    players: {
        first?: string;
        second?: string;
    };
    state: GameState;
    status: GameStatus;
    lastMove: number;
    createdAt: number;
}

export interface CreateGameRequest {
    playerId: string;
}

export interface CreateGameResponse {
    roomId: string;
    code: string;
    status: GameStatus;
    createdAt: number;
}

export interface JoinGameRequest {
    code: string;
    playerId: string;
}

export interface JoinGameResponse {
    roomId: string;
    status: GameStatus;
    playerType: PlayerRole;
    state: GameState;
}

export interface GameStateResponse {
    status: GameStatus;
    state: GameState;
    currentPlayer: PlayerRole;
    players: {
        first: string;
        second: string;
    };
}

export interface MakeMoveRequest {
    playerId: string;
    x: number;
    y: number;
}

export interface MakeMoveResponse {
    success: boolean;
    state: GameState;
    currentPlayer: PlayerRole;
}

export interface GameStateUpdate {
    type: "state_update";
    roomId: string;
    state: GameState;
    currentPlayer: PlayerRole;
    status: GameStatus;
    winner?: PlayerRole;
}

export interface GameHistory {
    roomId: string;
    code: string;
    players: {
        first: string;
        second: string;
    };
    startedAt: number;
    finishedAt: number;
    moves: Array<{
        player: PlayerRole;
        x: number;
        y: number;
        timestamp: number;
    }>;
    winner?: PlayerRole;
    finalState: GameState;
}