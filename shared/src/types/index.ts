// Re-export types from new structure
export * from './base.js';
// Export game types 
export * from './game.js';
// Export other type modules
export * from './storage.js';
export * from './network.js';
export * from './validation.js';
export * from './replay.js';
export * from './redis.js';

// Re-export constants
export {
    BOARD_SIZE,
    MIN_ADJACENT_FOR_REPLACE,
    MAX_PLACE_OPERATIONS
}
