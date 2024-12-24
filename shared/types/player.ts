import { IGameState } from './game';

export interface IPlayer {
    id: string;
    number: number;
}

export interface IGameRoom {
    gameId: string;
    players: IPlayer[];
    currentState: IGameState;
    currentPlayer: number;
}