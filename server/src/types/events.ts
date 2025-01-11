import { IGameState, IGameMove, WebSocketEvents } from '../shared';

export enum GameEventType {
    MOVE = 'move',
    DISCONNECT = 'disconnect',
    RECONNECT = 'reconnect',
    END_TURN = 'end_turn'
}

export interface IGameEvent {
    type: GameEventType;
    gameId: string;
    playerId: string;
    data: unknown;
    timestamp: number;
}

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