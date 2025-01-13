// Import and re-export basic types that we need
import type { IPosition } from './types/base/primitives';

// Re-export all types from new structure
export * from './types';
export * from './types/base';
export * from './types/game';
export * from './types/network';
export * from './types/storage';
export * from './types/validation';
export * from './types/replay';
export * from './types/redis';

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