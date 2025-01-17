import type { GameMove, GameState, UUID } from '../core.js';

export interface ReplayEvent {
  type: 'replay_start' | 'replay_step' | 'replay_complete' | 'replay_error';
  gameId: UUID;
  timestamp: number;
  data?: {
    move?: GameMove;
    state?: GameState;
    error?: string;
  };
}