export interface GameState {
  board: (number | null)[][];
  gameOver: boolean;
  winner: number | null;
}

export interface Player {
  id: string;
  number: number;
}

export interface Move {
  row: number;
  col: number;
}

export interface GameRoom {
  gameId: string;
  players: Player[];
  currentState: GameState;
  currentPlayer: number;
}