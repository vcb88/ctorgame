/**
 * TTL configuration and management types
 */

export interface TTLConfig {
    /** Base TTL values in seconds */
    readonly base: {
        /** Game state TTL (1 hour) */
        readonly gameState: number;
        /** Player session TTL (2 hours) */
        readonly playerSession: number;
        /** Game room TTL (1 hour) */
        readonly gameRoom: number;
        /** Events TTL (24 hours) */
        readonly events: number;
    };

    /** Extended TTL values for active games */
    readonly active: {
        /** Game state TTL (4 hours) */
        readonly gameState: number;
        /** Player session TTL (4 hours) */
        readonly playerSession: number;
        /** Game room TTL (4 hours) */
        readonly gameRoom: number;
    };

    /** Shortened TTL values for finished games */
    readonly finished: {
        /** Game state TTL (15 minutes) */
        readonly gameState: number;
        /** Player session TTL (15 minutes) */
        readonly playerSession: number;
        /** Game room TTL (15 minutes) */
        readonly gameRoom: number;
    };
}

export type GameStatus = 'waiting' | 'playing' | 'finished';

export interface TTLStrategy {
    /**
     * Get TTL for a specific key based on game status
     * @param key Redis key type
     * @param status Game status
     * @returns TTL in seconds
     */
    getTTL(key: keyof TTLConfig['base'], status: GameStatus): number;

    /**
     * Update TTLs for all game-related keys
     * @param gameId Game ID
     * @param status Game status
     */
    updateGameTTLs(gameId: string, status: GameStatus): Promise<void>;

    /**
     * Extend TTLs for active game
     * @param gameId Game ID
     */
    extendGameTTLs(gameId: string): Promise<void>;
}