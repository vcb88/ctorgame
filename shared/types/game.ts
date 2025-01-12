import { IPlayer } from './player.js';
import { IPosition, IBoard } from './coordinates.js';

/**
 * Game phase states
 */
export enum GamePhase {
    /** Initial state before game starts */
    INITIAL = 'INITIAL',
    /** Connecting to game */
    CONNECTING = 'CONNECTING',
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
 * Possible game outcomes
 */
export enum GameOutcome {
    /** Player won the game */
    Win = 'WIN',
    /** Player lost the game */
    Loss = 'LOSS',
    /** Game ended in a draw */
    Draw = 'DRAW'
}

/**
 * Represents the game manager state
 */
export interface GameManagerState {
    /** Current game phase */
    phase: GamePhase;
    /** Current game ID or null if not in game */
    gameId: string | null;
    /** Player's number in current game or null if not assigned */
    playerNumber: Player | null;
    /** Last error if any */
    error: Error | null;
    /** Connection state */
    connectionState: string;
}

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
    /** Number of remaining replace operations in current turn */
    replaceOperationsLeft: number;
    /** List of moves made in current turn */
    moves: IGameMove[];
}

/**
 * Represents players' scores using both legacy and enum-based fields
 */
export interface IScores {
    /** Legacy field for first player score */
    player1: number;
    /** Legacy field for second player score */
    player2: number;
    /** First player score using enum */
    [Player.First]: number;
    /** Second player score using enum */
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

// Board operations and directions are moved to coordinates.ts to avoid duplication