import type { GameError } from './core.js';

export enum GameErrorCode {
    INVALID_OPERATION = 'INVALID_OPERATION',
    INVALID_STATE = 'INVALID_STATE',
    GAME_NOT_FOUND = 'GAME_NOT_FOUND',
    INVALID_GAME_STATE = 'INVALID_GAME_STATE',
    DATA_ERROR = 'DATA_ERROR'
}

export type DataError = GameError & {
    code: GameErrorCode.DATA_ERROR;
    details?: {
        path?: string;
        value?: unknown;
    };
};

export type GameStateError = GameError & {
    code: GameErrorCode.GAME_NOT_FOUND | GameErrorCode.INVALID_GAME_STATE;
    details?: {
        gameId?: string;
        state?: string;
    };
};

/** Type guard to check if error is data related */
export function isDataError(error: GameError): error is DataError {
    return error.code === GameErrorCode.DATA_ERROR;
}

/** Type guard to check if error is game state related */
export function isGameStateError(error: GameError): error is GameStateError {
    return error.code === GameErrorCode.GAME_NOT_FOUND || 
           error.code === GameErrorCode.INVALID_GAME_STATE;
}

/** Helper to create error objects */
export const createGameError = {
    data: (message: string, details?: DataError['details']): DataError => ({
        code: GameErrorCode.DATA_ERROR,
        message,
        details
    }),
    
    gameState: (message: string, details?: GameStateError['details']): GameStateError => ({
        code: GameErrorCode.GAME_NOT_FOUND,
        message,
        details
    })
};