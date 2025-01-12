// Export base types and interfaces first
export * from '../types/index.js';

// Export utilities that use these types
export * from './utils/index.js';

// Export local interfaces with direct type references
export interface ReplaceCandidate {
    position: IPosition;
    isValid: boolean;
    adjacentCount: number;
    adjacentPositions: IPosition[];
    /** Calculated priority for this replacement (higher means more important) */
    priority: number;
}