import { IPlayer } from './player.js';
import { IPosition, IBoard } from './coordinates.js';

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
 * Legacy scores format
 */
export interface ILegacyScores {
    player1: number;
    player2: number;
}

/**
 * Modern scores format using Player enum
 */
export interface IEnumScores {
    [Player.First]: number;
    [Player.Second]: number;
}

/**
 * Represents players' scores
 * Supports both legacy and modern formats during migration
 */
export type IScores = ILegacyScores | IEnumScores;

/**
 * Converts legacy scores format to enum format
 */
export function legacyToEnumScores(scores: ILegacyScores): IEnumScores {
    return {
        [Player.First]: scores.player1,
        [Player.Second]: scores.player2
    };
}

/**
 * Converts enum scores format to legacy format
 */
export function enumToLegacyScores(scores: IEnumScores): ILegacyScores {
    return {
        player1: scores[Player.First],
        player2: scores[Player.Second]
    };
}

/**
 * Detects if scores are in legacy format
 */
export function isLegacyScores(scores: IScores): scores is ILegacyScores {
    return 'player1' in scores && 'player2' in scores;
}

/**
 * Detects if scores are in enum format
 */
export function isEnumScores(scores: IScores): scores is IEnumScores {
    return Player.First in scores && Player.Second in scores;
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

// Board operations and directions are moved to coordinates.ts to avoid duplication