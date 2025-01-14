import { GameMove } from '../../../shared/src/types/game/moves.js';
import { WebSocketEvents } from '../../../shared/src/types/base/network.js';

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

export type GameEventHandlers = {
  'create-game': () => Promise<void>;
  'join-game': (payload: { gameId: string }) => Promise<void>;
  'make-move': (payload: { gameId: string; move: GameMove }) => Promise<void>;
  'end-turn': (payload: { gameId: string }) => Promise<void>;
  'reconnect': (payload: { gameId: string }) => Promise<void>;
}

export interface GameEventResponse<T = any> {
  success: boolean;
  error?: string;
  data?: T;
  eventId?: string;
  message?: string;
}