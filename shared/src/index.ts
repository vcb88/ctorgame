// First export types to establish type definitions
export * from '../types/index.js';
// Then export utilities that might use these types
export * from './utils/index.js';

// Import types we need
import type { IReplaceValidation } from '../types/game.js';

// Export local interfaces
export interface ReplaceCandidate extends IReplaceValidation {
    /** Calculated priority for this replacement (higher means more important) */
    priority: number;
}