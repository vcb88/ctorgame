import { Socket } from 'socket.io-client';
import { IGameMove, IGameState, Player } from '@ctor-game/shared';

export interface ITurnState {
  placeOperationsLeft: number;
  replaceOperationsLeft: number;
  playerNumber: Player;
}

export interface IGameStateWithTurn extends IGameState {
  currentTurn: ITurnState;
  scores: {
    [Player.First]: number;
    [Player.Second]: number;
  };
  isFirstTurn: boolean;
}

export interface MockedSocket extends Socket {
  mockEmit: jest.Mock;
  mockOn: jest.Mock;
  mockOff: jest.Mock;
  mockClose: jest.Mock;
  simulateEvent: (event: string, data: unknown) => Promise<void>;
}

export interface GameHistoryEntry {
  moveNumber: number;
  playerNumber: Player;
  move: IGameMove;
  timestamp: Date;
}