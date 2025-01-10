import { IPlayer } from './player';
import { IPosition, IBoard } from './coordinates';

/**
 * Player identifiers in the game
 */
export enum Player {
    /** Empty cell or no player */
    None = 0,
    /** First player */
    First = 1,
    /** Second player */
    Second = 2
}

/**
 * Gets the opponent player
 * @param player Current player
 * @returns Opponent player (First -> Second, Second -> First)
 * @throws If player is None
 */
export function getOpponent(player: Player): Player {
    if (player === Player.None) {
        throw new Error('Cannot get opponent for Player.None');
    }
    return player === Player.First ? Player.Second : Player.First;
}

/**
 * Game outcome constants
 */
export const GameOutcome = {
    /** Represents a draw (no winner) */
    Draw: null,
} as const;

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
    [Player.First]: number;
    /** Second player's score */
    [Player.Second]: number;
}

/**
 * Represents complete game state
 */
export interface IGameState {
    /** Current board state */
    board: IBoard;
    /** Whether the game is over */
    gameOver: boolean;
    /** Winner (Player.First, Player.Second), null if game is not over or draw */
    winner: Player | null;
    /** Current turn state */
    currentTurn: ITurnState;
    /** Current player (Player.First or Player.Second) */
    currentPlayer: Player;
    /** Players' scores */
    scores: IScores;
    /** Whether this is the first turn of the game */
    isFirstTurn: boolean;
}

/**
 * Represents validation result for a replacement operation.
 * Note: The order of replacements doesn't affect the final board state
 * because each replacement only adds player's pieces and never removes them,
 * making it a deterministic cascade process.
 */
export interface IReplaceValidation {
    /** Position of the cell to be replaced */
    position: IPosition;
    /** Whether the replacement is valid */
    isValid: boolean;
    /** Number of adjacent pieces that make this replacement possible */
    adjacentCount: number;
    /** List of positions that contribute to this replacement */
    adjacentPositions: IPosition[];
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