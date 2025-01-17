/**
 * Core game constants
 */


/** Required number of adjacent pieces for replacement */
export const MIN_ADJACENT_FOR_REPLACE = 2;

/** Default TTL values */
export const DEFAULT_TTL = 3600; // 1 hour
export const GAME_STATE_TTL = 3600; // 1 hour
export const EVENT_TTL = 1800; // 30 minutes



/**
 * Shared game constants
 */

/** Game configuration */
export const BOARD_SIZE = 10;
export const PLAYERS = 2;
export const GAME_CODE_LENGTH = 4;

/** Game timing (in seconds) */
export const DEFAULT_GAME_TTL = 3600;      // 1 hour
export const DEFAULT_MOVE_TIMEOUT = 300;    // 5 minutes
export const MAX_GAME_DURATION = 7200;      // 2 hours
export const MIN_MOVE_TIME = 2;            // 2 seconds

/** Storage limits */
export const MAX_STORED_GAMES = 100000;

/** Network timeouts (in milliseconds) */
export const SOCKET_TIMEOUT = 5000;        // 5 seconds
export const RECONNECT_TIMEOUT = 3000;     // 3 seconds
export const MAX_RECONNECT_ATTEMPTS = 3;


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
    MIN_WIDTH: 5,
    MAX_WIDTH: 23,
    MIN_HEIGHT: 5,
    MAX_HEIGHT: 23,
    DEFAULT_WIDTH: 10,
    DEFAULT_HEIGHT: 10
} as const;

/** Game limits */
export const LIMITS = {

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