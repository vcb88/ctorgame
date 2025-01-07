// Re-export all shared types and interfaces
export * from '@/game';
export * from '@/player';
export * from '@/coordinates';

// Re-export shared constants from game
export {
    BOARD_SIZE,
    MIN_ADJACENT_FOR_REPLACE,
    MAX_PLACE_OPERATIONS,
    DIRECTIONS
} from '@/game';

// Export shared utilities
export function isValidGameId(id: string): boolean {
    return /^[0-9a-f]{24}$/.test(id);
}

export function isValidUsername(username: string): boolean {
    return username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_-]+$/.test(username);
}