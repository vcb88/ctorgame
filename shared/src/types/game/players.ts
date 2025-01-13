import { Player } from '../base/enums.js.js';

export interface IPlayer {
    id: string;
    number: Player;
}

export interface IGameRoom {
    gameId: string;
    players: IPlayer[];
    currentState: import('./state').IGameState;
    currentPlayer: Player;
