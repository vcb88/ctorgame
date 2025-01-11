import { WebSocketErrorCode, ErrorResponse } from './errors';

export { WebSocketErrorCode, ErrorResponse };

export interface GameEvent {
  eventId: string;
  timestamp: number;
  type: string;
  data?: any;
}