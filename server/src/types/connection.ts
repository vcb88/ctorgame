import { WebSocketErrorCode, ErrorResponse } from '@ctor-game/shared';

export { WebSocketErrorCode, ErrorResponse };

export interface GameEvent {
  eventId: string;
  timestamp: number;
  type: string;
  data?: any;
}