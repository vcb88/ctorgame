// Re-export validation functions from shared types
export { validatePosition } from '@ctor-game/shared/validation/primitives.js';
export { validateMove as validateGameMove, validateGameState } from '@ctor-game/shared/validation/game.js';