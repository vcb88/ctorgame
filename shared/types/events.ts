import { GamePhase, Player } from './base';
import { IGameState } from './state';
import { IGameRoom } from './game';

export enum WebSocketErrorCode {
    INVALID_GAME_ID = 'INVALID_GAME_ID',
    GAME_FULL = 'GAME_FULL',
    GAME_NOT_FOUND = 'GAME_NOT_FOUND',
    GAME_ALREADY_STARTED = 'GAME_ALREADY_STARTED',
    INVALID_MOVE = 'INVALID_MOVE',
    NOT_YOUR_TURN = 'NOT_YOUR_TURN',
    GAME_OVER = 'GAME_OVER',
    INVALID_STATE = 'INVALID_STATE',
    INTERNAL_ERROR = 'INTERNAL_ERROR'
}

export interface ErrorResponse {
    code: WebSocketErrorCode;
    message: string;
    details?: Record<string, unknown>;
}

export interface ServerToClientEvents {
    [WebSocketEvents.GameCreated]: (payload: WebSocketPayloads[WebSocketEvents.GameCreated]) => void;
    [WebSocketEvents.GameJoined]: (payload: WebSocketPayloads[WebSocketEvents.GameJoined]) => void;
    [WebSocketEvents.GameStarted]: (payload: WebSocketPayloads[WebSocketEvents.GameStarted]) => void;
    [WebSocketEvents.GameStateUpdated]: (payload: WebSocketPayloads[WebSocketEvents.GameStateUpdated]) => void;
    [WebSocketEvents.GameOver]: (payload: WebSocketPayloads[WebSocketEvents.GameOver]) => void;
    [WebSocketEvents.PlayerDisconnected]: (payload: WebSocketPayloads[WebSocketEvents.PlayerDisconnected]) => void;
    [WebSocketEvents.Error]: (payload: WebSocketPayloads[WebSocketEvents.Error]) => void;
}

export interface ClientToServerEvents {
    [WebSocketEvents.CreateGame]: (payload: WebSocketPayloads[WebSocketEvents.CreateGame]) => void;
    [WebSocketEvents.JoinGame]: (payload: WebSocketPayloads[WebSocketEvents.JoinGame]) => void;
    [WebSocketEvents.MakeMove]: (payload: WebSocketPayloads[WebSocketEvents.MakeMove]) => void;
    [WebSocketEvents.EndTurn]: (payload: WebSocketPayloads[WebSocketEvents.EndTurn]) => void;
    [WebSocketEvents.Disconnect]: (payload: WebSocketPayloads[WebSocketEvents.Disconnect]) => void;
}

export enum WebSocketEvents {
    // Client -> Server events
    CreateGame = 'createGame',
    JoinGame = 'joinGame',
    MakeMove = 'makeMove',
    EndTurn = 'endTurn',
    Disconnect = 'disconnect',
    Reconnect = 'reconnect',

    // Server -> Client events
    GameCreated = 'gameCreated',
    GameJoined = 'gameJoined',
    GameStarted = 'gameStarted',
    GameStateUpdated = 'gameStateUpdated',
    GameOver = 'gameOver',
    PlayerDisconnected = 'playerDisconnected',
    PlayerReconnected = 'playerReconnected',
    GameExpired = 'gameExpired',
    Error = 'error'
}

export interface WebSocketPayloads {
    // Client -> Server requests
    [WebSocketEvents.CreateGame]: void;
    [WebSocketEvents.JoinGame]: {
        gameId: string;
    };
    [WebSocketEvents.MakeMove]: {
        gameId: string;
        move: {
            type: 'place' | 'replace';
            position: { x: number; y: number };
        };
    };
    [WebSocketEvents.EndTurn]: {
        gameId: string;
    };
    [WebSocketEvents.Disconnect]: void;

    // Server -> Client responses
    [WebSocketEvents.GameCreated]: {
        gameId: string;
        eventId: string;
    };
    [WebSocketEvents.GameJoined]: {
        gameId: string;
        eventId: string;
        phase: GamePhase;
    };
    [WebSocketEvents.GameStarted]: {
        gameState: IGameState;
        currentPlayer: number;
        eventId: string;
        phase: GamePhase;
    };
    [WebSocketEvents.GameStateUpdated]: {
        gameState: IGameState;
        currentPlayer: number;
        phase: GamePhase;
    };
    [WebSocketEvents.GameOver]: {
        gameState: IGameState;
        winner: number | null;
    };
    [WebSocketEvents.PlayerDisconnected]: {
        player: number;
    };
    [WebSocketEvents.Error]: {
        code: string;
        message: string;
        details?: unknown;
    };
}

export interface IGameEvent {
    type: 'move' | 'disconnect' | 'reconnect' | 'end_turn';
    gameId: string;
    playerId: string;
    data: Record<string, any>;
    timestamp: number;
}

export interface ReconnectionData {
    gameId: string;
    playerNumber: number;
    lastEventId?: string;
    timestamp: number;
}