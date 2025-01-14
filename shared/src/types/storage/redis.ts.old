import { IPlayer } from '../game/players.js';

// Redis specific types
export interface IRedisGameState {
    lastUpdate: number;
    [key: string]: unknown;
}

export interface IRedisPlayerSession {
    gameId: string;
    playerNumber: number;
    lastActivity: number;
}

export interface IRedisGameRoom {
    players: IPlayer[];
    status: 'waiting' | 'playing';
    lastUpdate: number;
}

export interface IRedisGameEvent {
    gameId: string;
    type: string;
    data: unknown;
    timestamp: number;
}