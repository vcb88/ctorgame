/**
 * Core game constants
 */

/** Board size (8x8) */
export const BOARD_SIZE = 8;

/** Required number of adjacent pieces for replacement */
export const MIN_ADJACENT_FOR_REPLACE = 2;

/** Default TTL values */
export const DEFAULT_TTL = 3600; // 1 hour
export const GAME_STATE_TTL = 3600; // 1 hour
export const EVENT_TTL = 1800; // 30 minutes

/** Limits */
export const MAX_PLAYERS = 2;
export const MAX_MOVES = 64; // BOARD_SIZE * BOARD_SIZE