import { IGameState, IPlayer } from './index.js';

export interface IRedisGameState extends IGameState {
    lastUpdate: number;
}

export interface IRedisPlayerSession {
    gameId: string;
    playerNumber: number;
    lastActivity: number;
}

export interface IRedisGameRoom {
    players: IPlayer[];
    status: 'waiting' | 'playing' | 'finished';
    lastUpdate: number;
}

export interface IRedisGameEvent {
    type: 'move' | 'disconnect' | 'reconnect' | 'end_turn';
    gameId: string;
    playerId: string;
    data: unknown;
    timestamp: number;
}

export interface ICacheConfig {
    ttl: {
        gameState: number;
        playerSession: number;
        gameRoom: number;
    };
}