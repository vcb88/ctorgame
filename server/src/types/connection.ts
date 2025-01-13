import type { ErrorResponse } from '@ctor-game/shared/types/network';

export type { ErrorResponse };

export interface GameEvent {
  eventId: string;
  timestamp: number;
  type: string;
  data?: any;
}