// Re-export all types for backwards compatibility
export * from './base';
export * from './game';
export * from './storage';

// TODO: Move these to appropriate modules
export * from './events';
export * from './web-socket-types';
export * from './replay';
export * from './redis';
export * from './validation-types';

// Re-export constants
export {
    BOARD_SIZE,
    MIN_ADJACENT_FOR_REPLACE,
    MAX_PLACE_OPERATIONS
} from './constants';