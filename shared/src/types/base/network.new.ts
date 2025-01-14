import type { IGameState } from '../game/state.js';
import type { IGameMoveComplete } from '../game/moves.js';
import type { PlayerNumber } from '../game/players.js';

/**
 * WebSocket event types
 */
export const WebSocketEvents = {
    CreateGame: 'create-game',
    GameCreated: 'game-created',
    JoinGame: 'join-game',
    GameJoined: 'game-joined',
    GameStarted: 'game-started',
    MakeMove: 'make-move',
    EndTurn: 'end-turn',
    GameStateUpdated: 'game-state-updated',
    AvailableReplaces: 'available-replaces',
    GameOver: 'game-over',
    Reconnect: 'reconnect',
    Error: 'error'
} as const;

export type WebSocketEventType = typeof WebSocketEvents[keyof typeof WebSocketEvents];

/**
 * WebSocket error codes
 */
export const WebSocketErrorCode = {
    INVALID_GAME_ID: 'invalid_game_id',
    GAME_ENDED: 'game_ended',
    NOT_YOUR_TURN: 'not_your_turn',
    INVALID_STATE: 'invalid_state',
    SERVER_ERROR: 'server_error'
} as const;

export type WebSocketErrorCodeType = typeof WebSocketErrorCode[keyof typeof WebSocketErrorCode];

/**
 * Server to client events
 */
export type ServerToClientEvents = {
    'game-created': (data: { 
        readonly gameId: string; 
        readonly eventId: string 
    }) => void;

    'game-joined': (data: { 
        readonly gameId: string; 
        readonly eventId: string; 
        readonly phase: string 
    }) => void;

    'game-started': (data: { 
        readonly gameState: IGameState; 
        readonly currentPlayer: PlayerNumber; 
        readonly eventId: string; 
        readonly phase: string 
    }) => void;

    'game-state-updated': (data: { 
        readonly gameState: IGameState; 
        readonly currentPlayer: PlayerNumber; 
        readonly phase: string 
    }) => void;

    'available-replaces': (data: { 
        readonly moves: ReadonlyArray<IGameMoveComplete>; 
        readonly replacements: ReadonlyArray<[number, number]> 
    }) => void;

    'game-over': (data: { 
        readonly gameState: IGameState; 
        readonly winner: PlayerNumber | null 
    }) => void;

    'error': (data: { 
        readonly code: WebSocketErrorCodeType; 
        readonly message: string; 
        readonly details?: Readonly<Record<string, unknown>> 
    }) => void;
};

/**
 * Client to server events
 */
export type ClientToServerEvents = {
    'create-game': () => void;

    'join-game': (data: { 
        readonly gameId: string 
    }) => void;

    'make-move': (data: { 
        readonly gameId: string; 
        readonly move: IGameMoveComplete 
    }) => void;

    'end-turn': (data: { 
        readonly gameId: string 
    }) => void;

    'reconnect': (data: { 
        readonly gameId: string 
    }) => void;
};

export type ServerToClientEventType = keyof ServerToClientEvents;
export type ClientToServerEventType = keyof ClientToServerEvents;