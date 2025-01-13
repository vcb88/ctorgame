// Import and re-export basic types that we need
import type { IPosition } from './types/basic-types';

// Re-export all base types
export * from './types/basic-types';
export * from './types/base';
export * from './types/moves';
export * from './types/state';
export * from './types/game';
export * from './types/events';
export * from './types/web-socket-types';
export * from './types/replay';
export * from './types/redis';
export * from './types/payloads';
export * from './types/validation-types';

// Export utilities
export * from './utils/index';

// Export local interfaces
export interface ReplaceCandidate {
    position: IPosition;
    isValid: boolean;
    adjacentCount: number;
    adjacentPositions: IPosition[];
    /** Calculated priority for this replacement (higher means more important) */
    priority: number;
}