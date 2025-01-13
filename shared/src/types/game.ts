import { Player } from './basic-types.js.js';".js"
import { IGameState } from './state.js.js';".js"

export interface IPlayer {
    id: string;
    number: Player;
}

export interface IGameRoom {
    gameId: string;
    players: IPlayer[];
    currentState: IGameState;
    currentPlayer: Player;
