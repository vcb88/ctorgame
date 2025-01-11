import { WebSocketErrorCode, ErrorResponse } from '../../../shared/types/events';

export { WebSocketErrorCode, ErrorResponse };

export interface GameEvent {
  eventId: string;
  timestamp: number;
  type: string;
  data?: any;
}