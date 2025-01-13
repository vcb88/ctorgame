/**
 * This is the main entry point for basic types and utilities.
 * For specific domain types, use direct imports:
 * 
 * import { IGameState } from '@ctor-game/shared/game';
 * import { IPlayer } from '@ctor-game/shared/game';
 * import { INetworkEvent } from '@ctor-game/shared/network';
 * etc.
 */

// Export basic types that are commonly used
export * from './types/base';

// Export constants
export * from './types/constants';

// Export utilities
export * from './utils/index';

// Common interfaces used across multiple domains
import type { IPosition } from './types/base/primitives';

export interface ReplaceCandidate {
    position: IPosition;
    isValid: boolean;
    adjacentCount: number;
    adjacentPositions: IPosition[];
    /** Calculated priority for this replacement (higher means more important) */
    priority: number;
}