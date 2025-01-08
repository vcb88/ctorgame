import { IGameState, IGameMove, WebSocketEvents } from '@ctor-game/shared';

export interface GameEventHandlers {
  [WebSocketEvents.CreateGame]: () => Promise<void>;
  [WebSocketEvents.JoinGame]: (payload: { gameId: string }) => Promise<void>;
  [WebSocketEvents.MakeMove]: (payload: { gameId: string; move: IGameMove }) => Promise<void>;
  [WebSocketEvents.EndTurn]: (payload: { gameId: string }) => Promise<void>;
  [WebSocketEvents.Reconnect]: (payload: { gameId: string }) => Promise<void>;
}

export interface GameEventResponse {
  success: boolean;
  error?: string;
  data?: any;
}