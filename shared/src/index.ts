/**
 * This is the main entry point for basic types and utilities.
 * For specific domain types, use direct imports:
 * 
 * import { IGameState } from '@ctor-game/shared/game';
 * import { IPlayer } from '@ctor-game/shared/game';
 * import { INetworkEvent } from '@ctor-game/shared/network';
 * etc.
 */

// Re-export from base types
export type {
    IPosition,
    IBoardSize
} from './types/base/primitives';

export {
    GamePhase,
} from './types/base/enums';

// Re-export game constants
export {
    BOARD_SIZE,
    MIN_ADJACENT_FOR_REPLACE,
    MAX_PLACE_OPERATIONS
} from './types/constants';

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