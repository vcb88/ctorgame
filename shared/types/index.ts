export interface IGameState {
  board: (number | null)[][];
  gameOver: boolean;
  winner: number | null;
}

export interface IPlayer {
  id: string;
  number: number;
}

export interface IMove {
  row: number;
  col: number;
}

export interface IGameRoom {
  gameId: string;
  players: IPlayer[];
  currentState: IGameState;
  currentPlayer: number;
}