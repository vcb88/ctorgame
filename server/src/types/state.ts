// This is a copy of shared state types
// Must be kept in sync with shared/types/game.ts and events.ts

/**
 * Game phase states
 */
export enum GamePhase {
    /** Initial state before game starts */
    INITIAL = 'INITIAL',
    /** Waiting for other player */
    WAITING = 'WAITING',
    /** Game in progress */
    PLAYING = 'PLAYING',
    /** Game finished */
    FINISHED = 'FINISHED',
    /** Error state */
    ERROR = 'ERROR'
}

/**
 * Connection states
 */
export enum ConnectionState {
    CONNECTING = 'CONNECTING',
    CONNECTED = 'CONNECTED',
    DISCONNECTED = 'DISCONNECTED',
    RECONNECTING = 'RECONNECTING',
    ERROR = 'ERROR'
}

/**
 * Error structure for game errors
 */
export interface GameError {
    code: string;
    message: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    details?: Record<string, unknown>;
    timestamp?: number;
    recoverable?: boolean;
    retryCount?: number;
}