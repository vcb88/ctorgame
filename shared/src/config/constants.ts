/**
 * Shared game constants
 */

/** Game configuration */
export const BOARD_SIZE = 8;
export const MAX_PLAYERS = 2;
export const MIN_PLAYERS = 2;
export const GAME_CODE_LENGTH = 4;

/** Game timing (in seconds) */
export const DEFAULT_GAME_TTL = 3600;      // 1 hour
export const DEFAULT_MOVE_TIMEOUT = 300;    // 5 minutes
export const MAX_GAME_DURATION = 7200;      // 2 hours
export const MIN_MOVE_TIME = 2;            // 2 seconds

/** Storage limits */
export const MAX_STORED_GAMES = 1000;
export const MAX_MOVES_PER_GAME = 64;      // BOARD_SIZE * BOARD_SIZE
export const MAX_HISTORY_AGE = 30 * 24 * 3600; // 30 days

/** Network timeouts (in milliseconds) */
export const SOCKET_TIMEOUT = 5000;        // 5 seconds
export const RECONNECT_TIMEOUT = 3000;     // 3 seconds
export const MAX_RECONNECT_ATTEMPTS = 3;

/** Score configuration */
export const POINTS_FOR_CAPTURE = 1;
export const POINTS_FOR_TERRITORY = 2;