// Import and re-export basic types that we need
import type { IPosition } from '../types/basic-types.js';

// Re-export all base types
export * from '../types/basic-types.js';
export * from '../types/base.js';
export * from '../types/moves.js';
export * from '../types/state.js';
export * from '../types/game.js';
export * from '../types/events.js';
export * from '../types/web-socket-types.js';
export * from '../types/replay.js';
export * from '../types/redis.js';
export * from '../types/payloads.js';
export * from '../types/validation-types.js';

// Export utilities
export * from './utils/index.js';

// Export local interfaces
export interface ReplaceCandidate {
    position: IPosition;
    isValid: boolean;
    adjacentCount: number;
    adjacentPositions: IPosition[];
    /** Calculated priority for this replacement (higher means more important) */
    priority: number;
}