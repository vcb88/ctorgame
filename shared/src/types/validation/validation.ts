import type { GameState, Size, PlayerNumber, UUID } from '../base/types.js';

export interface ValidationEvent {
  type: 'validation_start' | 'validation_complete' | 'validation_error';
  gameId: UUID;
  timestamp: number;
  data?: {
    state?: GameState;
    size?: Size;
    player?: PlayerNumber;
    errors?: string[];
  };
}