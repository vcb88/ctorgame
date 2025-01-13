import { IPosition, IBoard, IGameState } from './index.js';

/**
 * Represents the strength evaluation of a position
 */
export interface IPositionStrength {
    /** Number of pieces the player has */
    pieces: number;
    /** Percentage of territory controlled (0-100) */
    territory: number;
    /** Influence score (0-100) */
    influence: number;
    /** Combined strength of connected groups */
    groupsStrength: number;
    /** Overall position evaluation */
    total: number;
}

/**
 * Represents a move evaluation result
 */
export interface IMoveEvaluation {
    /** Position of the move */
    position: IPosition;
    /** Calculated score for the move */
    score: number;
    /** Individual evaluation components */
    components: {
        /** Territory control score */
        territory: number;
        /** Replacement potential score */
        replacement: number;
        /** Mobility score */
        mobility: number;
        /** Pattern-based score */
        pattern: number;
        /** Danger level */
        danger: number;
        /** Group formation score */
        group: number;
        /** Blocking value */
        block: number;
    };
}

/**
 * AI configuration options
 */
export interface IAIConfig {
    /** Evaluation weights */
    weights: {
        /** Weight for territory control */
        territory: number;
        /** Weight for replacement potential */
        replacement: number;
        /** Weight for mobility */
        mobility: number;
        /** Weight for pattern matching */
        pattern: number;
        /** Weight for danger evaluation */
        danger: number;
        /** Weight for group formation */
        group: number;
        /** Weight for blocking moves */
        block: number;
    };
    /** Maximum calculation time in milliseconds */
    maxThinkTime?: number;
    /** Maximum search depth */
    maxDepth?: number;
    /** Whether to use advanced features */
    usePatternMatching?: boolean;
}

/**
 * Interface for AI implementations
 */
export interface IGameAI {
    /** Initialize AI with configuration */
    initialize(config: IAIConfig): void;
    /** Find best move in current position */
    findBestMove(state: IGameState): Promise<IMoveEvaluation>;
    /** Evaluate position strength */
    evaluatePosition(board: IBoard, player: number): IPositionStrength;
    /** Analyze specific position */
    analyzeMove(state: IGameState, position: IPosition): IMoveEvaluation;
}