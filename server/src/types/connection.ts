import type { ErrorResponse } from '@ctor-game/shared';

export type { ErrorResponse };

export interface GameEvent {
  eventId: string;
  timestamp: number;
  type: string;
  data?: any;
}