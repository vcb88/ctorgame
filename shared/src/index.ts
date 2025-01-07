// Re-export all shared types and interfaces
export * from '../types/game';
export * from '../types/player';
export * from '../types/coordinates';
export * from '../types/events';
export * from '../types/websocket';

// Re-export shared constants from game
export {
    BOARD_SIZE,
    MIN_ADJACENT_FOR_REPLACE,
    MAX_PLACE_OPERATIONS,
    DIRECTIONS
} from '../types/game';

// Export shared utilities
export function isValidGameId(id: string): boolean {
    return /^[0-9a-f]{24}$/.test(id);
}

export function isValidUsername(username: string): boolean {
    return username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_-]+$/.test(username);
}