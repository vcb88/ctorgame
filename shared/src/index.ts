// Re-export all shared types from index
export * from '../types';

// Re-export validation utilities
export * from '../validation/game';

// Export shared utilities
export function isValidGameId(id: string): boolean {
    return /^[0-9a-f]{24}$/.test(id);
}

export function isValidUsername(username: string): boolean {
    return username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_-]+$/.test(username);
}