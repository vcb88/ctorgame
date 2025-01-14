import { logger } from '../utils/logger.js';

import type {
    IGameState,
    IGameMove,
    IPosition,
    PlayerNumber,
    OperationType,
    IScores,
    ISize
} from '@ctor-game/shared/types/core/base.js';

// Constants
const BOARD_SIZE = 8;
const MIN_ADJACENT_FOR_REPLACE = 2;
const MAX_PLACE_OPERATIONS = 2;

// Utils
import { getAdjacentPositions } from '@ctor-game/shared/utils/coordinates.js';

/**
 * Validation result for replace operations
 */
interface IReplaceValidation {
    isValid: boolean;
    replacements: ReadonlyArray<readonly [number, number]>;
    message: string;
}

/**
 * Get opponent's player number
 */
function getOpponent(player: PlayerNumber): PlayerNumber {
    return player === 1 ? 2 : 1;
}

/**
 * Create initial scores object
 */
function createScores(player1: number, player2: number): IScores {
    return { player1, player2 };
}

export class GameLogicService {
    /**
     * Creates initial game state
     * First turn is special - only 1 place operation allowed
     */
    static createInitialState(): IGameState {
        const size: ISize = { width: BOARD_SIZE, height: BOARD_SIZE };
        return {
            id: crypto.randomUUID(),
            board: Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)),
            size,
            turn: {
                currentPlayer: 1,
                placeOperationsLeft: 1,
                moves: []
            },
            scores: createScores(0, 0),
            status: 'playing',
            timestamp: Date.now(),
            isFirstTurn: true
        };
    }

    /**
     * Checks if the move is valid
     */
    static isValidMove(state: IGameState, move: IGameMove, playerNumber: PlayerNumber): boolean {
        const { type, position } = move;
        const { x, y } = position;
        const { width, height } = state.size;

        // Check basic conditions
        if (x < 0 || x >= width || y < 0 || y >= height) {
            return false;
        }

        if (type === 'place') {
            // For place operation check:
            // 1. Place operations left
            // 2. Cell is empty
            // 3. First turn allows only one operation
            return (
                state.turn.placeOperationsLeft > 0 &&
                state.board[y][x] === null &&
                (!state.isFirstTurn || state.turn.moves.length < 1)
            );
        } else if (type === 'replace') {
            // For replace operation check:
            // 1. Cell contains opponent's piece
            // 2. Enough adjacent pieces
            return (
                state.board[y][x] === getOpponent(playerNumber) &&
                this.validateReplace(state, position, playerNumber).isValid
            );
        }

        return false;
    }

    /**
     * Validates replace operation
     */
    static validateReplace(
        state: IGameState,
        position: IPosition,
        playerNumber: PlayerNumber
    ): IReplaceValidation {
        const startTime = Date.now();
        const adjacentPositions = getAdjacentPositions(position, state.size);
        const playerPieces = adjacentPositions.filter(
            (pos: IPosition) => state.board[pos.y][pos.x] === playerNumber
        );
        
        const validation: IReplaceValidation = {
            isValid: playerPieces.length >= MIN_ADJACENT_FOR_REPLACE,
            replacements: playerPieces.map((pos: IPosition): [number, number] => [pos.x, pos.y]),
            message: playerPieces.length >= MIN_ADJACENT_FOR_REPLACE ? 
                'Valid replacement' : 
                `Not enough adjacent pieces (${playerPieces.length}/${MIN_ADJACENT_FOR_REPLACE})`
        };

        logger.game.validation(validation.isValid, 
            validation.isValid ? 'valid_replace' : 'invalid_replace', 
            {
                position,
                playerNumber,
                adjacentCount: playerPieces.length,
                required: MIN_ADJACENT_FOR_REPLACE,
                duration: Date.now() - startTime
            }
        );

        return validation;
    }

    /**
     * Applies move to current game state
     */
    static applyMove(state: IGameState, move: IGameMove, playerNumber: PlayerNumber): IGameState {
        const startTime = Date.now();
        logger.game.move('applying', move, {
            playerNumber,
            state: {
                currentPlayer: state.turn.currentPlayer,
                operationsLeft: state.turn.placeOperationsLeft,
                isFirstTurn: state.isFirstTurn
            }
        });

        const newState = this.cloneGameState(state);
        const { type, position } = move;
        const { x, y } = position;

        if (type === 'place') {
            // Place the piece
            newState.board[y][x] = playerNumber;
            
            // Update turn state
            newState.turn = {
                ...newState.turn,
                placeOperationsLeft: newState.turn.placeOperationsLeft - 1
            };
            
            // If this was first game turn, update flag
            if (state.isFirstTurn) {
                newState.isFirstTurn = false;
            }
            
            // Check turn end (no operations left or first turn completed)
            if (newState.turn.placeOperationsLeft === 0) {
                newState.turn = {
                    currentPlayer: getOpponent(newState.turn.currentPlayer),
                    placeOperationsLeft: newState.isFirstTurn ? 1 : MAX_PLACE_OPERATIONS,
                    moves: []
                };
            }

            // Automatically perform all possible replacements
            let replacementsFound;
            do {
                replacementsFound = false;
                const availableReplaces = this.getAvailableReplaces(newState, playerNumber);
                
                if (availableReplaces.length > 0) {
                    replacementsFound = true;
                    logger.game.move('auto_replace', availableReplaces, {
                        playerNumber,
                        count: availableReplaces.length
                    });
                    
                    for (const replaceMove of availableReplaces) {
                        const { x: replaceX, y: replaceY } = replaceMove.position;
                        newState.board[replaceY][replaceX] = playerNumber;
                    }
                }
            } while (replacementsFound);
        }

        // Add move to history
        newState.turn.moves = [...newState.turn.moves, move];

        // Update scores
        this.updateScores(newState);

        // Check game over
        if (this.checkGameOver(newState)) {
            newState.status = 'finished';
            const winner = this.determineWinner(newState.scores);
            if (winner) {
                newState.turn.currentPlayer = winner;
            }
        }

        newState.timestamp = Date.now();

        const duration = Date.now() - startTime;
        logger.game.performance('apply_move', duration, {
            move,
            playerNumber,
            replacements: newState.turn.moves.length - state.turn.moves.length - 1,
            gameOver: newState.status === 'finished',
            winner: newState.turn.currentPlayer,
            duration
        });

        return newState;
    }

    /**
     * Gets available replacements after piece placement
     */
    static getAvailableReplaces(state: IGameState, playerNumber: PlayerNumber): IGameMove[] {
        const availableReplaces: IGameMove[] = [];
        const { width, height } = state.size;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Check only opponent's pieces
                if (state.board[y][x] === getOpponent(playerNumber)) {
                    const position: IPosition = { x, y };
                    const candidate = this.validateReplace(state, position, playerNumber);
                    if (candidate.isValid) {
                        availableReplaces.push({
                            type: 'replace',
                            position,
                            player: playerNumber,
                            timestamp: Date.now()
                        });
                    }
                }
            }
        }

        return availableReplaces;
    }

    /**
     * Updates game scores
     */
    private static updateScores(state: IGameState): void {
        let player1Count = 0;
        let player2Count = 0;
        const { width, height } = state.size;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const cell = state.board[y][x];
                if (cell === 1) player1Count++;
                else if (cell === 2) player2Count++;
            }
        }

        state.scores = createScores(player1Count, player2Count);
    }

    /**
     * Checks if the game is over
     */
    private static checkGameOver(state: IGameState): boolean {
        // Game ends when all cells are occupied
        return state.board.every(row => row.every(cell => cell !== null));
    }

    /**
     * Determines winner by scores
     */
    private static determineWinner(scores: IScores): PlayerNumber | null {
        if (scores.player1 > scores.player2) return 1;
        if (scores.player2 > scores.player1) return 2;
        return null;
    }

    /**
     * Creates a deep copy of game state
     */
    private static cloneGameState(state: IGameState): IGameState {
        return {
            id: state.id,
            board: state.board.map(row => [...row]),
            size: { ...state.size },
            turn: {
                currentPlayer: state.turn.currentPlayer,
                placeOperationsLeft: state.turn.placeOperationsLeft,
                moves: [...state.turn.moves]
            },
            scores: { ...state.scores },
            status: state.status,
            timestamp: Date.now(),
            isFirstTurn: state.isFirstTurn
        };
    }
}