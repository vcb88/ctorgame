import { Player, GameStatus, IBoardSize } from './basic-types';
import { IGameState } from './state';
import { GameMove } from './moves';

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

