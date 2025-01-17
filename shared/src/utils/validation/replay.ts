/**
 * Validation utilities for replay and history system
 */

import type { 
    ReplayState,
    GameHistoryEntry,
    ValidationError
} from '../../types/base/types.js';

/**
 * Validates replay state object
 * @throws {ValidationError} if validation fails
 */
export function validateReplayState(state: unknown): asserts state is ReplayState {
    if (!state || typeof state !== 'object') {
        throw new ValidationError('Invalid replay state object');
    }

    const replayState = state as Record<string, unknown>;
    
    if (typeof replayState.currentMoveIndex !== 'number' || replayState.currentMoveIndex < 0) {
        throw new ValidationError('Invalid currentMoveIndex');
    }
    
    if (typeof replayState.totalMoves !== 'number' || replayState.totalMoves < 0) {
        throw new ValidationError('Invalid totalMoves');
    }
    
    if (typeof replayState.isPlaying !== 'boolean') {
        throw new ValidationError('Invalid isPlaying flag');
    }
    
    if (typeof replayState.playbackSpeed !== 'number' || replayState.playbackSpeed <= 0) {
        throw new ValidationError('Invalid playback speed');
    }
    
    if (typeof replayState.gameCode !== 'string' || !replayState.gameCode) {
        throw new ValidationError('Invalid game code');
    }
}

/**
 * Validates game history entry
 * @throws {ValidationError} if validation fails
 */
export function validateGameHistoryEntry(entry: unknown): asserts entry is GameHistoryEntry {
    if (!entry || typeof entry !== 'object') {
        throw new ValidationError('Invalid history entry object');
    }

    const historyEntry = entry as Record<string, unknown>;

    if (typeof historyEntry.gameCode !== 'string' || !historyEntry.gameCode) {
        throw new ValidationError('Invalid game code in history entry');
    }

    if (typeof historyEntry.startTime !== 'string' || !historyEntry.startTime) {
        throw new ValidationError('Invalid start time');
    }

    if (historyEntry.endTime !== undefined && (typeof historyEntry.endTime !== 'string' || !historyEntry.endTime)) {
        throw new ValidationError('Invalid end time');
    }

    if (!Array.isArray(historyEntry.players)) {
        throw new ValidationError('Players must be an array');
    }

    if (!historyEntry.players.every(player => typeof player === 'string')) {
        throw new ValidationError('All players must be strings');
    }

    if (historyEntry.winner !== undefined && typeof historyEntry.winner !== 'string') {
        throw new ValidationError('Winner must be a string if present');
    }

    if (typeof historyEntry.totalMoves !== 'number' || historyEntry.totalMoves < 0) {
        throw new ValidationError('Invalid total moves count');
    }
}

/**
 * Type guard for replay state
 */
export function isReplayState(state: unknown): state is ReplayState {
    try {
        validateReplayState(state);
        return true;
    } catch {
        return false;
    }
}

/**
 * Type guard for history entry
 */
export function isGameHistoryEntry(entry: unknown): entry is GameHistoryEntry {
    try {
        validateGameHistoryEntry(entry);
        return true;
    } catch {
        return false;
    }
}

/**
 * Validates move index bounds
 * @throws {ValidationError} if index is out of bounds
 */
export function validateMoveIndex(index: number, totalMoves: number): void {
    if (typeof index !== 'number' || index < 0 || index > totalMoves) {
        throw new ValidationError(`Move index ${index} is out of bounds [0..${totalMoves}]`);
    }
}

/**
 * Validates playback speed value
 * @throws {ValidationError} if speed is invalid
 */
export function validatePlaybackSpeed(speed: number): void {
    if (typeof speed !== 'number' || speed <= 0) {
        throw new ValidationError('Invalid playback speed value');
    }
}