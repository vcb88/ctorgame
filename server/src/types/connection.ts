import type { GameError } from '@ctor-game/shared/src/types/core.js';
import type { 
    WebSocketEvent,
    WebSocketErrorResponse 
} from '@ctor-game/shared/src/types/network/websocket.js';

export type { WebSocketErrorResponse as ErrorResponse };
export type { WebSocketEvent as GameEvent };