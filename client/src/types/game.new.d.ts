import { Socket } from 'socket.io-client';
import type { IGameMove } from '@ctor-game/shared/src/types/game/types.js';
import type { IGameState } from '@ctor-game/shared/src/types/game/state.js';
import type { PlayerNumber } from '@ctor-game/shared/src/types/game/types.js';

export interface ITurnState {
  readonly placeOperations: number;
  readonly replaceOperations: number;
  readonly playerNumber: PlayerNumber;
}

export interface IGameStateWithTurn extends IGameState {
  readonly currentTurn: ITurnState;
  readonly isFirstTurn: boolean;
}

export interface MockedSocket extends Socket {
  readonly mockEmit: jest.Mock;
  readonly mockOn: jest.Mock;
  readonly mockOff: jest.Mock;
  readonly mockClose: jest.Mock;
  simulateEvent: (event: string, data: unknown) => Promise<void>;
}

export interface IGameHistoryEntry {
  readonly moveNumber: number;
  readonly playerNumber: PlayerNumber;
  readonly move: IGameMove;
  readonly timestamp: Date;
}