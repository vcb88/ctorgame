import { WebSocketErrorCode } from '../base/enums.js';
import { WebSocketEvents, WebSocketPayloads } from './websocket.js';

export interface ServerToClientEvents {
    [WebSocketEvents.GameCreated]: (payload: WebSocketPayloads[WebSocketEvents.GameCreated]) => void;
    [WebSocketEvents.GameJoined]: (payload: WebSocketPayloads[WebSocketEvents.GameJoined]) => void;
    [WebSocketEvents.GameStarted]: (payload: WebSocketPayloads[WebSocketEvents.GameStarted]) => void;
    [WebSocketEvents.GameStateUpdated]: (payload: WebSocketPayloads[WebSocketEvents.GameStateUpdated]) => void;
    [WebSocketEvents.GameOver]: (payload: WebSocketPayloads[WebSocketEvents.GameOver]) => void;
    [WebSocketEvents.PlayerDisconnected]: (payload: WebSocketPayloads[WebSocketEvents.PlayerDisconnected]) => void;
    [WebSocketEvents.PlayerReconnected]: (payload: WebSocketPayloads[WebSocketEvents.PlayerReconnected]) => void;
    [WebSocketEvents.GameExpired]: (payload: WebSocketPayloads[WebSocketEvents.GameExpired]) => void;
    [WebSocketEvents.Error]: (payload: WebSocketPayloads[WebSocketEvents.Error]) => void;
    [WebSocketEvents.AvailableReplaces]: (payload: WebSocketPayloads[WebSocketEvents.AvailableReplaces]) => void;
}

export interface ClientToServerEvents {
    [WebSocketEvents.CreateGame]: () => void;
    [WebSocketEvents.JoinGame]: (payload: WebSocketPayloads[WebSocketEvents.JoinGame]) => void;
    [WebSocketEvents.MakeMove]: (payload: WebSocketPayloads[WebSocketEvents.MakeMove]) => void;
    [WebSocketEvents.EndTurn]: (payload: WebSocketPayloads[WebSocketEvents.EndTurn]) => void;
    [WebSocketEvents.Disconnect]: () => void;
    [WebSocketEvents.Reconnect]: (payload: WebSocketPayloads[WebSocketEvents.Reconnect]) => void;
}

export interface ErrorResponse {
    code: WebSocketErrorCode;
    message: string;
    details?: Record<string, unknown>;
}

export interface IGameEvent {
    type: WebSocketEvents.MakeMove | WebSocketEvents.Disconnect | WebSocketEvents.Reconnect | WebSocketEvents.EndTurn;
    gameId: string;
    playerId: string;
    data: WebSocketPayloads[WebSocketEvents.MakeMove | WebSocketEvents.Disconnect | WebSocketEvents.Reconnect | WebSocketEvents.EndTurn];
    timestamp: number;
}

export interface ReconnectionData {
    gameId: string;
    playerNumber: number;
    lastEventId?: string;
    timestamp: number;
}
