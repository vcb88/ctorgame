/**
 * Basic type aliases and re-exports
 * @deprecated Use types from base/primitives.js directly
 */

import { PlayerNumber, Position, Size, GameStatus } from './base/primitives.js';

export type { Position, Size, GameStatus };

// Extended player type including "none" (0)
export type ExtendedPlayer = 0 | PlayerNumber;  // 0 for None, 1 or 2 for players
