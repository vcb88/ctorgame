/** Error codes enum for type safety */
export enum GameErrorCode {
    // Network related
    NETWORK_ERROR = 'NETWORK_ERROR',
    CONNECTION_LOST = 'CONNECTION_LOST',
    
    // Game state related
    GAME_NOT_FOUND = 'GAME_NOT_FOUND',
    INVALID_GAME_STATE = 'INVALID_GAME_STATE',
    
    // Auth related
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN',
    
    // Data related
    INVALID_DATA = 'INVALID_DATA',
    DATA_NOT_FOUND = 'DATA_NOT_FOUND',
    
    // Generic
    UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/** Base error interface */
export interface IGameError {
    code: GameErrorCode;
    message: string;
    details?: Record<string, unknown>;
}

/** Network specific error interface */
export interface INetworkError extends IGameError {
    code: GameErrorCode.NETWORK_ERROR | GameErrorCode.CONNECTION_LOST;
    details?: {
        statusCode?: number;
        endpoint?: string;
    };
}

/** Data related error interface */
export interface IDataError extends IGameError {
    code: GameErrorCode.INVALID_DATA | GameErrorCode.DATA_NOT_FOUND;
    details?: {
        field?: string;
        value?: unknown;
    };
}

/** Game state error interface */
export interface IGameStateError extends IGameError {
    code: GameErrorCode.GAME_NOT_FOUND | GameErrorCode.INVALID_GAME_STATE;
    details?: {
        gameId?: string;
        currentState?: string;
    };
}

/** Type guard to check if error is network related */
export function isNetworkError(error: IGameError): error is INetworkError {
    return error.code === GameErrorCode.NETWORK_ERROR || 
           error.code === GameErrorCode.CONNECTION_LOST;
}

/** Type guard to check if error is data related */
export function isDataError(error: IGameError): error is IDataError {
    return error.code === GameErrorCode.INVALID_DATA || 
           error.code === GameErrorCode.DATA_NOT_FOUND;
}

/** Type guard to check if error is game state related */
export function isGameStateError(error: IGameError): error is IGameStateError {
    return error.code === GameErrorCode.GAME_NOT_FOUND || 
           error.code === GameErrorCode.INVALID_GAME_STATE;
}

/** Error factory for creating typed errors */
export const createGameError = {
    network: (message: string, details?: INetworkError['details']): INetworkError => ({
        code: GameErrorCode.NETWORK_ERROR,
        message,
        details
    }),
    
    data: (message: string, details?: IDataError['details']): IDataError => ({
        code: GameErrorCode.INVALID_DATA,
        message,
        details
    }),
    
    gameState: (message: string, details?: IGameStateError['details']): IGameStateError => ({
        code: GameErrorCode.GAME_NOT_FOUND,
        message,
        details
    })
};