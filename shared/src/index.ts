/**
 * @ctor-game/shared
 * 
 * This package contains shared types, utilities and validation functions.
 * Please use direct imports from specific modules to optimize tree-shaking:
 * 
 * Core Types:
 * import type { INumeric, IIdentifiable } from '@ctor-game/shared/types/core/primitives';
 * 
 * Game Types:
 * import type { 
 *   IGameState,
 *   PlayerNumber,
 *   GameStatus,
 *   IGameMove
 * } from '@ctor-game/shared/types/game/types';
 * 
 * Geometry Types:
 * import type { 
 *   IPosition, 
 *   ISize, 
 *   IBoardPosition 
 * } from '@ctor-game/shared/types/geometry/types';
 * 
 * Utils:
 * import { 
 *   getOpponent,
 *   createInitialState,
 *   isValidGameState
 * } from '@ctor-game/shared/utils/game';
 * 
 * import {
 *   normalizePosition,
 *   getAdjacentPositions
 * } from '@ctor-game/shared/utils/coordinates';
 * 
 * import {
 *   createScores,
 *   updateScores,
 *   getWinnerFromScores
 * } from '@ctor-game/shared/utils/scores';
 * 
 * Validation:
 * import { 
 *   validateGameMove,
 *   validateGameState,
 *   isValidPlayerNumber
 * } from '@ctor-game/shared/validation/game';
 * 
 * import {
 *   validatePosition,
 *   validateSize,
 *   isPosition
 * } from '@ctor-game/shared/validation/primitives';
 */

// This is just a documentation file.
// Do not use barrel exports to avoid circular dependencies and improve tree-shaking.