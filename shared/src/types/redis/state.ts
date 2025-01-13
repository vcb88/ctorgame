import { IGameState } from '../game/state';
import { IPlayer } from '../game/players';
import { GameStatus } from '../base/primitives';

// Base interface for Redis stored objects
export interface IRedisBase {
    lastUpdate: number;
}

// Game state in Redis
export interface IRedisGameState extends IGameState, IRedisBase {
    version?: number; // Optional version for state migrations
}

// Game room in Redis
export interface IRedisGameRoom extends IRedisBase {
    players: IPlayer[];
    status: GameStatus;
    maxPlayers?: number; // Make it optional for backwards compatibility
    expiresAt?: number;
}