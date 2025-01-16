/**
 * Global constants and configuration values
 */

/** Time constants (in milliseconds) */
export const TIME = {
    SECOND: 1000,
    MINUTE: 60 * 1000,
    HOUR: 60 * 60 * 1000,
    DAY: 24 * 60 * 60 * 1000,

    // Game specific timeouts
    TURN_TIMEOUT: 5 * 60 * 1000,      // 5 minutes
    GAME_TIMEOUT: 60 * 60 * 1000,     // 1 hour
    INACTIVE_TIMEOUT: 15 * 60 * 1000, // 15 minutes
    RECONNECT_TIMEOUT: 30 * 1000,     // 30 seconds
} as const;

/** Board dimensions */
export const BOARD = {
    MIN_WIDTH: 3,
    MAX_WIDTH: 10,
    MIN_HEIGHT: 3,
    MAX_HEIGHT: 10,
    DEFAULT_WIDTH: 8,
    DEFAULT_HEIGHT: 8
} as const;

/** Game limits */
export const LIMITS = {
    MAX_PLAYERS: 2,
    MIN_PLAYERS: 2,
    MAX_MOVES_PER_TURN: 3,
    MAX_REPLACE_PER_TURN: 1,
    MAX_GAMES_PER_USER: 5,
    MAX_CONCURRENT_GAMES: 100
} as const;

/** Network configuration */
export const NETWORK = {
    DEFAULT_PORT: 3000,
    WS_PATH: '/ws',
    PING_INTERVAL: 30 * 1000,         // 30 seconds
    PING_TIMEOUT: 5 * 1000,           // 5 seconds
    MAX_RECONNECT_ATTEMPTS: 5,
    RECONNECT_DELAY: 1000             // 1 second
} as const;

/** Storage configuration */
export const STORAGE = {
    MAX_HISTORY_SIZE: 1000,
    MAX_SNAPSHOTS: 10,
    CLEANUP_INTERVAL: 60 * 60 * 1000, // 1 hour
    DEFAULT_TTL: 24 * 60 * 60         // 24 hours
} as const;

/** Validation constants */
export const VALIDATION = {
    MIN_NAME_LENGTH: 3,
    MAX_NAME_LENGTH: 20,
    MAX_MESSAGE_LENGTH: 1000,
    ALLOWED_SYMBOLS: /^[a-zA-Z0-9_-]+$/
} as const;