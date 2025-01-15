import { Player, PlayerNumber, Timestamp } from './core.js';

export interface IPlayer {
    id: string;
    number: Player;
}

export interface IGameRoom {
    gameId: string;
    players: IPlayer[];
    currentState: IGameState;
    currentPlayer: Player;
}

/** Summary of a game for history view */
export interface IGameSummary {
    /** Unique game code/identifier */
    gameCode: string;
    /** When the game was created */
    createdAt: Timestamp;
    /** When the game was completed (null if still in progress) */
    completedAt: Timestamp | null;
    /** Winner of the game (null if draw or in progress) */
    winner: PlayerNumber | null;
    /** Players who participated in the game */
    players: Player[];
}
