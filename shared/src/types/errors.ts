import type { ErrorCode, GameError, BaseError } from './core.js';

export interface DataError extends BaseError {
    category: 'game';
    code: 'INVALID_DATA';
    severity: 'error';
    details?: {
        path?: string;
        value?: unknown;
    };
}

export interface GameStateError extends BaseError {
    category: 'game';
    code: 'INVALID_STATE' | 'GAME_NOT_FOUND';
    severity: 'error';
    details?: {
        gameId?: string;
        state?: string;
    };
}

/** Type guard to check if error is data related */
export function isDataError(error: GameError): error is DataError {
    return error.code === 'INVALID_DATA';
}

/** Type guard to check if error is game state related */
export function isGameStateError(error: GameError): error is GameStateError {
    return error.code === 'GAME_NOT_FOUND' || error.code === 'INVALID_STATE';
}

/** Helper to create error objects */
export function createDataError(message: string, details?: DataError['details']): DataError {
    return {
        category: 'game',
        code: 'INVALID_DATA',
        severity: 'error',
        message,
        details,
        timestamp: Date.now()
    };
}

export function createGameStateError(code: 'INVALID_STATE' | 'GAME_NOT_FOUND', message: string, details?: GameStateError['details']): GameStateError {
    return {
        category: 'game',
        code,
        severity: 'error',
        message,
        details,
        timestamp: Date.now()
    };
};