import { WebSocketErrorCode, ErrorResponse } from '@ctor-game/shared';

export { WebSocketErrorCode };
export type { ErrorResponse };

export interface GameEvent {
  eventId: string;
  timestamp: number;
  type: string;
  data?: any;
}