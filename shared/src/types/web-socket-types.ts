import { Player } from './basic-types';
import { WebSocketErrorCode, GamePhase } from './base';
import { GameMove } from './moves';
import { IGameState } from './state';

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
    Error = 'error',
    AvailableReplaces = 'availableReplaces'
}

// Тип для событий сервера -> клиент
export type ServerToClientEventType = 
    | WebSocketEvents.GameCreated 
    | WebSocketEvents.GameJoined 
    | WebSocketEvents.GameStarted 
    | WebSocketEvents.GameStateUpdated 
    | WebSocketEvents.GameOver 
    | WebSocketEvents.PlayerDisconnected 
    | WebSocketEvents.PlayerReconnected 
    | WebSocketEvents.GameExpired 
    | WebSocketEvents.Error 
    | WebSocketEvents.AvailableReplaces;

// Тип для событий клиент -> сервер
export type ClientToServerEventType = 
    | WebSocketEvents.CreateGame 
    | WebSocketEvents.JoinGame 
    | WebSocketEvents.MakeMove 
    | WebSocketEvents.EndTurn 
    | WebSocketEvents.Disconnect 
    | WebSocketEvents.Reconnect;

export type WebSocketPayloads = {
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
    [WebSocketEvents.Reconnect]: {
        gameId: string;
    };

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
    [WebSocketEvents.PlayerReconnected]: {
        player: number;
        gameState: IGameState;
        currentPlayer: Player;
    };
    [WebSocketEvents.GameExpired]: {
        gameId: string;
        reason?: string;
    };
    [WebSocketEvents.Error]: {
        code: WebSocketErrorCode;
        message: string;
        details?: unknown;
    };
    [WebSocketEvents.AvailableReplaces]: {
        replacements: Array<[number, number]>;
        moves: GameMove[];
    };
}