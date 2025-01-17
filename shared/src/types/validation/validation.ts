import type { GameState, BoardSize, PlayerNumber, UUID } from '../core.js';

export interface ValidationEvent {
  type: 'validation_start' | 'validation_complete' | 'validation_error';
  gameId: UUID;
  timestamp: number;
  data?: {
    state?: GameState;
    size?: BoardSize;
    player?: PlayerNumber;
    errors?: string[];
  };
}