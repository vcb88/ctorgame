import { IGameState, IGameMove, WebSocketEvents } from '@ctor-game/shared';

export interface GameEventHandlers {
  'createGame': () => Promise<void>;
  'joinGame': (payload: { gameId: string }) => Promise<void>;
  'makeMove': (payload: { gameId: string; move: IGameMove }) => Promise<void>;
  'endTurn': (payload: { gameId: string }) => Promise<void>;
  'reconnect': (payload: { gameId: string }) => Promise<void>;
}

export interface GameEventResponse {
  success: boolean;
  error?: string;
  data?: any;
}