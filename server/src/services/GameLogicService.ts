import { logger } from '../utils/logger.js';
import { create2DArrayCopy, update2DArrayValue } from '../utils/array.js';
import type {
    Position,
    Size,
    PlayerNumber,
    GameStatus,
    Scores,
    GameState,
    GameMove,
    CellValue
} from '@ctor-game/shared/types/core.js';

type Board = ReadonlyArray<ReadonlyArray<CellValue>>;
import { getAdjacentPositions } from '../utils/geometry.js';
import { getOpponent } from '../utils/game.js';

import { BOARD_SIZE, MIN_ADJACENT_FOR_REPLACE } from '../config/constants.js';

/**
 * Custom type for validation result of replacement operation
 */
type ReplaceValidation = {
  isValid: boolean;
  replacements: Position[];
  message: string;
};

/**
 * Game logic implementation
 */
export class GameLogicService {
  /**
   * Создает начальное состояние игры
   * Первый ход в игре особенный - только 1 операция размещения
   * @returns Начальное состояние игры
   */
  static createInitialState(): GameState {
    // Create empty board with 0 values (empty cells)
    const board: Board = Array(BOARD_SIZE)
      .fill(0)
      .map(() => Object.freeze(Array(BOARD_SIZE).fill(0)));

    // Set initial scores
    const scores: Scores = [0, 0];

    // Create initial state
    return {
      board: Object.freeze(board),
      scores,
      currentPlayer: 1 as PlayerNumber,
      status: 'active' as GameStatus,
      timestamp: Date.now()
    };
  }

  /**
   * Проверяет, является ли ход допустимым
   * @param state Текущее состояние игры
   * @param move Проверяемый ход
   * @param playerNumber Номер игрока, делающего ход
   * @returns true если ход допустим
   */
  static isValidMove(state: GameState, move: GameMove, playerNumber: PlayerNumber): boolean {
    // Нельзя делать ходы, если игра завершена
    if (state.status === 'finished') {
      return false;
    }

    const { type, pos } = move;
    if (!pos) return false;
    
    const [x, y] = pos;

    // Check basic conditions
    if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) {
      return false;
    }

    if (type === 'place') {
      // For placement operation check if cell is empty
      return state.board[y][x] === 0;
    } else if (type === 'replace') {
      // For replacement operation check:
      // 1. If cell contains opponent's piece
      // 2. If there are enough player's pieces around
      return (
        state.board[y][x] === getOpponent(playerNumber) &&
        this.validateReplace(state.board, pos, playerNumber).isValid
      );
    }

    return false;
  }

  /**
   * Проверяет возможность замены фишки
   */
  static validateReplace(
    board: ReadonlyArray<ReadonlyArray<CellValue>>,
    position: Position,
    playerNumber: PlayerNumber
  ): ReplaceValidation {
    const startTime = Date.now();
    const adjacentPositions = getAdjacentPositions(position);
    const playerPieces = adjacentPositions.filter(
      (pos: Position) => {
        const [x, y] = pos;
        return board[y][x] === playerNumber;
      }
    );
    
    const validation: ReplaceValidation = {
      isValid: playerPieces.length >= MIN_ADJACENT_FOR_REPLACE,
      replacements: playerPieces,
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
   * Применяет ход к текущему состоянию игры
   */
  static applyMove(state: GameState, move: GameMove, playerNumber: PlayerNumber): GameState {
    const startTime = Date.now();
    logger.game.move('applying', move, {
      playerNumber,
      state: {
        currentPlayer: state.currentPlayer
      }
    });

    let newBoard = state.board;
    const { type, pos } = move;
    if (!pos) return state;
    const [x, y] = pos;

    if (type === 'place') {
      // Размещаем фишку
      newBoard = update2DArrayValue(state.board, x, y, playerNumber);

      // Автоматически выполняем все возможные замены
      let replacementsFound;
      do {
        replacementsFound = false;
        const tempState = {
          ...state,
          board: newBoard
        };
        const availableReplaces = this.getAvailableReplaces(tempState, playerNumber);
        
        if (availableReplaces.length > 0) {
          replacementsFound = true;
          logger.game.move('auto_replace', availableReplaces, {
            playerNumber,
            count: availableReplaces.length
          });
          
          for (const replaceMove of availableReplaces) {
            if (replaceMove.pos) {
              const [replaceX, replaceY] = replaceMove.pos;
              newBoard = update2DArrayValue(newBoard, replaceX, replaceY, playerNumber);
            }
          }
        }
      } while (replacementsFound);
    }

    // Создаем новое состояние с обновленными значениями
    const newState = {
      ...state,
      board: newBoard,
      lastMove: move
    };

    // Проверяем окончание игры и обновляем статус
    const isGameOver = this.checkGameOver(newBoard);
    const scores = this.calculateScores(newBoard);
    const status = isGameOver ? 'finished' : state.status;

    const finalState = {
      ...newState,
      scores,
      status
    };

    const duration = Date.now() - startTime;
    logger.game.performance('apply_move', duration, {
      move,
      playerNumber,
      status,
      isGameOver,
      scores,
      duration
    });

    return finalState;
  }

  /**
   * Проверяет доступные замены после размещения фишки
   */
  static getAvailableReplaces(state: GameState, playerNumber: PlayerNumber): GameMove[] {
    const availableReplaces: GameMove[] = [];

    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        // Проверяем только фишки противника
        if (state.board[y][x] === getOpponent(playerNumber)) {
          const position: Position = [x, y];
          const candidate = this.validateReplace(state.board, position, playerNumber);
          if (candidate.isValid) {
            availableReplaces.push({
              type: 'replace',
              pos: position
            });
          }
        }
      }
    }

    return availableReplaces;
  }

  /**
   * Проверяет, закончилась ли игра
   */
  private static checkGameOver(board: ReadonlyArray<ReadonlyArray<CellValue>>): boolean {
    // Game ends when there are no empty cells
    return board.every(row => row.every(cell => cell !== 0));
  }

  /**
   * Вычисляет текущий счет игры
   */
  private static calculateScores(board: ReadonlyArray<ReadonlyArray<CellValue>>): Scores {
    let player1Count = 0;
    let player2Count = 0;

    for (const row of board) {
      for (const cell of row) {
        if (cell === 1) player1Count++;
        else if (cell === 2) player2Count++;
      }
    }

    return [player1Count, player2Count];
  }
}