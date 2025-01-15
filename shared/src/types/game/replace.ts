import type { Position } from '../core.js';

export type ReplaceCandidate = {
    position: Position;
    isValid: boolean;
    adjacentCount: number;
    adjacentPositions: Position[];
    /** Calculated priority for this replacement (higher means more important) */
    priority: number;
};
