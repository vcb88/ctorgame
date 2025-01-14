import { Socket } from 'socket.io-client';
import type { GameMove } from '@ctor-game/shared/types/game/moves';
import type { IGameState } from '@ctor-game/shared/types/game/state';
import type { Player } from '@ctor-game/shared/types/enums';

export interface ITurnState {
  placeOperationsLeft: number;
  replaceOperationsLeft: number;
  playerNumber: Player;
}

export interface IGameStateWithTurn extends IGameState {
  currentTurn: ITurnState;
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
  move: GameMove;
  timestamp: Date;
}