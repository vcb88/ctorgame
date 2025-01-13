import { Player } from '../base/enums';

export interface IPlayer {
    id: string;
    number: Player;
}

export interface IGameRoom {
    gameId: string;
    players: IPlayer[];
    currentState: import('./state').IGameState;
    currentPlayer: Player;
}