import type { IErrorResponse } from '@ctor-game/shared/types/network/errors';

export type { IErrorResponse as ErrorResponse };

export interface GameEvent {
  eventId: string;
  timestamp: number;
  type: string;
  data?: any;
}