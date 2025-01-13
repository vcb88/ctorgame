// Import constants
import {
    BOARD_SIZE,
    MIN_ADJACENT_FOR_REPLACE,
    MAX_PLACE_OPERATIONS
} from './base.js';

// Re-export types from new structure
export * from './base.js';
// Export game types 
export * from './game.js';
// Export other type modules
export * from './storage/index.js';
export * from './network/index.js';
export * from './validation/index.js';
export * from './replay/index.js';
export * from './redis/index.js';

// Re-export constants
export {
    BOARD_SIZE,
    MIN_ADJACENT_FOR_REPLACE,
    MAX_PLACE_OPERATIONS
}
