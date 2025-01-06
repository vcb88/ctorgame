import { Socket } from 'socket.io-client';
import { IGameMove, IGameState } from '@ctor-game/shared/types';

export interface ITurnState {
  placeOperationsLeft: number;
  replaceOperationsLeft: number;
  playerNumber: number;
}

export interface IGameStateWithTurn extends IGameState {
  currentTurn: ITurnState;
  scores: {
    player1: number;
    player2: number;
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
  playerNumber: number;
  move: IGameMove;
  timestamp: Date;
}