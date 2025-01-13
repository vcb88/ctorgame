import { WebSocketErrorCode, ErrorResponse } from '@ctor-game/shared';

export type { WebSocketErrorCode, ErrorResponse };

export interface GameEvent {
  eventId: string;
  timestamp: number;
  type: string;
  data?: any;
}