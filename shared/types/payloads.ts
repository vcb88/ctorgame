import { GamePhase, Player, WebSocketErrorCode } from './base';
import { IGameState } from './state';
import { GameMove } from './moves';

// Basic payload types that don't depend on complex game types
export interface BasicPosition {
    x: number;
    y: number;
}

export interface BasicMove {
    type: 'place' | 'replace';
    position: BasicPosition;
}

// WebSocket payload definitions
export interface BaseGamePayload {
    gameId: string;
    eventId?: string;
}

export interface GameCreatedPayload extends BaseGamePayload {}

export interface GameJoinedPayload extends BaseGamePayload {
    phase: GamePhase;
}

export interface GameStartedPayload extends BaseGamePayload {
    gameState: IGameState;
    currentPlayer: Player;
    phase: GamePhase;
}

export interface GameStateUpdatedPayload extends BaseGamePayload {
    gameState: IGameState;
    currentPlayer: Player;
    phase: GamePhase;
}

export interface GameOverPayload extends BaseGamePayload {
    gameState: IGameState;
    winner: Player | null;
}

export interface PlayerDisconnectedPayload {
    player: Player;
}

export interface PlayerReconnectedPayload {
    player: Player;
    gameState: IGameState;
    currentPlayer: Player;
}

export interface GameExpiredPayload {
    gameId: string;
    reason?: string;
}

export interface ErrorPayload {
    code: WebSocketErrorCode;
    message: string;
    details?: unknown;
}

export interface AvailableReplacesPayload {
    replacements: Array<[number, number]>;
    moves: GameMove[];
}

// Client request payloads
export interface JoinGamePayload {
    gameId: string;
}

export interface MakeMovePayload {
    gameId: string;
    move: BasicMove;
}

export interface EndTurnPayload {
    gameId: string;
}

export interface ReconnectPayload {
    gameId: string;
}