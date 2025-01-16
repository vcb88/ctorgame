import type { GameAI as IGameAI, AIConfig, MoveEvaluation, PositionStrength } from '@ctor-game/shared/types/core/ai';
import type { GameState } from '@ctor-game/shared/types/game';
import type { Board } from '@ctor-game/shared/types/core/board';
import type { Position } from '@ctor-game/shared/types/base/primitives';

/**
 * Default AI configuration
 */
const DEFAULT_CONFIG: AIConfig = {
    weights: {
        territory: 1.5,
        replacement: 1.2,
        mobility: 0.8,
        pattern: 1.0,
        danger: 2.0,
        group: 1.5,
        block: 1.8
    },
    maxThinkTime: 1000,
    maxDepth: 2,
    usePatternMatching: false
};

/**
 * Implementation of game AI based on original version
 */
export class GameAI implements IGameAI {
    private config: AIConfig = DEFAULT_CONFIG;

    /**
     * Initialize AI with configuration
     */
    initialize(config: Partial<AIConfig>): void {
        this.config = {
            ...DEFAULT_CONFIG,
            ...config,
            weights: {
                ...DEFAULT_CONFIG.weights,
                ...(config.weights || {})
            }
        };
    }

    /**
     * Find best move in current position
     */
    async findBestMove(state: GameState): Promise<MoveEvaluation> {
        const startTime = Date.now();
        let bestMove: MoveEvaluation | null = null;

        // Evaluate all possible moves
        for (let x = 0; x < state.board.size.width; x++) {
            for (let y = 0; y < state.board.size.height; y++) {
                // Check timeout
                if (this.config.maxThinkTime && Date.now() - startTime > this.config.maxThinkTime) {
                    break;
                }

                const position: Position = [x, y];
                const evaluation = this.analyzeMove(state, position);

                if (!bestMove || evaluation.score > bestMove.score) {
                    bestMove = evaluation;
                }
            }
        }

        if (!bestMove) {
            throw new Error('No valid moves found');
        }

        return bestMove;
    }

    /**
     * Evaluate position strength
     */
    evaluatePosition(board: Board, player: number): PositionStrength {
        let pieces = 0;
        let territory = 0;
        let influence = 0;
        let groupsStrength = 0;

        // Count pieces and evaluate basic metrics
        for (let x = 0; x < board.size.width; x++) {
            for (let y = 0; y < board.size.height; y++) {
                if (board.cells[x][y] === player) {
                    pieces++;
                    // Add territory control
                    this.forEachNeighbor(board, x, y, 2, (nx, ny) => {
                        if (board.cells[nx][ny] === 0) {
                            territory++;
                        }
                    });
                    
                    // Evaluate groups
                    let groupSize = 0;
                    this.forEachNeighbor(board, x, y, 1, (nx, ny) => {
                        if (board.cells[nx][ny] === player) {
                            groupSize++;
                        }
                    });
                    if (groupSize > 0) {
                        groupsStrength += groupSize;
                    }
                }
            }
        }

        // Normalize values
        const maxTerritory = board.size.width * board.size.height;
        const normalizedTerritory = (territory / maxTerritory) * 100;
        const normalizedGroupsStrength = (groupsStrength / pieces) * 100;

        // Calculate total score
        const total = 
            pieces * 10 + 
            normalizedTerritory * 0.5 + 
            influence * 0.3 + 
            normalizedGroupsStrength * 0.2;

        return {
            pieces,
            territory: Math.round(normalizedTerritory),
            influence: Math.round(influence),
            groupsStrength: Math.round(normalizedGroupsStrength),
            total: Math.round(total)
        };
    }

    /**
     * Analyze specific move
     */
    analyzeMove(state: GameState, position: Position): MoveEvaluation {
        const evaluation = this.evaluateMove(state, position);
        
        // Apply weights from configuration
        const score = 
            evaluation.territory * this.config.weights.territory +
            evaluation.replacement * this.config.weights.replacement +
            evaluation.mobility * this.config.weights.mobility +
            evaluation.pattern * this.config.weights.pattern +
            evaluation.danger * this.config.weights.danger +
            evaluation.group * this.config.weights.group +
            evaluation.block * this.config.weights.block;

        return {
            position,
            score,
            components: evaluation
        };
    }

    /**
     * Helper method to iterate over neighboring cells
     */
    private forEachNeighbor(
        board: Board,
        x: number,
        y: number,
        radius: number,
        callback: (nx: number, ny: number, distance: number) => void
    ): void {
        for (let dx = -radius; dx <= radius; dx++) {
            for (let dy = -radius; dy <= radius; dy++) {
                if (dx === 0 && dy === 0) continue;
                const distance = Math.abs(dx) + Math.abs(dy);
                if (distance <= radius) {
                    const nx = ((x + dx + board.size.width) % board.size.width);
                    const ny = ((y + dy + board.size.height) % board.size.height);
                    callback(nx, ny, distance);
                }
            }
        }
    }

    /**
     * Evaluate all components of a move
     */
    private evaluateMove(state: GameState, position: Position): MoveEvaluation['components'] {
        let territory = 0;
        let replacement = 0;
        let mobility = 0;
        let pattern = 0;
        let danger = 0;
        let group = 0;
        let block = 0;

        // Count territory control
        this.forEachNeighbor(state.board, position.x, position.y, 2, (nx, ny) => {
            if (state.board.cells[nx][ny] === 0) {
                territory++;
            }
        });

        // Evaluate replacement potential
        let ownCount = 0;
        this.forEachNeighbor(state.board, position.x, position.y, 1, (nx, ny) => {
            if (state.board.cells[nx][ny] === state.currentPlayer) {
                ownCount++;
                if (ownCount >= 4) replacement += 10;
            }
        });

        // For now, return basic evaluation
        // TODO: Implement remaining evaluation components
        return {
            territory,
            replacement,
            mobility,
            pattern,
            danger,
            group,
            block
        };
    }
}