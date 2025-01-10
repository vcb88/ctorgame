import { IPlayer } from './player';
import { IPosition, IBoard } from './coordinates';

/**
 * Game configuration constants
 */
export const BOARD_SIZE = 10;
export const MIN_ADJACENT_FOR_REPLACE = 5;
export const MAX_PLACE_OPERATIONS = 2;

/**
 * Represents possible game operation types
 */
export enum OperationType {
    /** Place a new piece on the board */
    PLACE = 'place',
    /** Replace opponent's piece */
    REPLACE = 'replace',
    /** End current turn */
    END_TURN = 'end_turn'
}

/**
 * Represents a single game move
 */
export interface IGameMove {
    /** Type of the operation */
    type: OperationType;
    /** Position on the board */
    position: IPosition;
}

/**
 * Represents the state of the current turn
 */
export interface ITurnState {
    /** Number of remaining place operations in current turn */
    placeOperationsLeft: number;
    /** List of moves made in current turn */
    moves: IGameMove[];
}

/**
 * Represents players' scores
 */
export interface IScores {
    /** First player's score */
    player1: number;
    /** Second player's score */
    player2: number;
}

/**
 * Represents complete game state
 */
export interface IGameState {
    /** Current board state */
    board: IBoard;
    /** Whether the game is over */
    gameOver: boolean;
    /** Winner player number (1 or 2), null if game is not over or draw */
    winner: number | null;
    /** Current turn state */
    currentTurn: ITurnState;
    /** Current player number (1 or 2) */
    currentPlayer: number;
    /** Players' scores */
    scores: IScores;
    /** Whether this is the first turn of the game */
    isFirstTurn: boolean;
}

/**
 * Represents validation result for replace operation
 */
export interface IReplaceValidation {
    /** Whether the replace operation is valid */
    isValid: boolean;
    /** Number of adjacent pieces found */
    adjacentCount: number;
    /** List of positions that would be affected */
    positions: IPosition[];
}

/**
 * Array of relative coordinates for checking adjacent cells
 */
export const DIRECTIONS = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],          [0, 1],
    [1, -1],  [1, 0],  [1, 1]
] as const;

/**
 * Gets all adjacent positions considering board's toroidal nature
 * @param pos Center position
 * @param board Game board
 * @returns Array of adjacent positions
 */
export const getAdjacentPositions = (pos: IPosition, board: IBoard): IPosition[] => {
    return DIRECTIONS.map(([dx, dy]) => ({
        x: ((pos.x + dx + board.size.width) % board.size.width),
        y: ((pos.y + dy + board.size.height) % board.size.height)
    }));
};