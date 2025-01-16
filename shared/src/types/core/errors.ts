/**
 * Simplified error handling
 */

/** Basic error codes */
export type ErrorCode = 
    | 'invalid_move'      // Move is not possible
    | 'wrong_turn'        // Not player's turn
    | 'game_over'         // Game is finished
    | 'invalid_position'  // Position outside board
    | 'cell_occupied'     // Cell is not empty
    | 'network_error'     // Network issues
    | 'system_error';     // Internal errors

/** Unified error structure */
export interface GameError {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
}

/** Error factory */
export const createError = (
    code: ErrorCode, 
    message: string, 
    details?: Record<string, unknown>
): GameError => ({
    code,
    message,
    details
});

/** Predefined game errors */
export const GameErrors = {
    invalidMove: (reason: string) => 
        createError('invalid_move', `Invalid move: ${reason}`),
    
    wrongTurn: () => 
        createError('wrong_turn', 'Not your turn'),
    
    gameOver: () => 
        createError('game_over', 'Game is already over'),
    
    invalidPosition: (x: number, y: number) => 
        createError('invalid_position', `Position {${x}, ${y}} is outside the board`),
    
    cellOccupied: (x: number, y: number) => 
        createError('cell_occupied', `Cell at {${x}, ${y}} is already occupied`)
};