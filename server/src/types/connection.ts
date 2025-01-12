import { WebSocketErrorCode, ErrorResponse } from '../shared';

export { WebSocketErrorCode, ErrorResponse };

export interface GameEvent {
  eventId: string;
  timestamp: number;
  type: string;
  data?: any;
}