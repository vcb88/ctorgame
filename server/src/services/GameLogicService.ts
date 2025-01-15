import { logger } from '../utils/logger';
import { create2DArrayCopy, update2DArrayValue } from '../utils/array';
import type { IPosition } from '@ctor-game/shared/types/geometry/types';
import type {
    IGameState,
    IGameMove,
    PlayerNumber,
    GameStatus,
    IGameScores,
} from '@ctor-game/shared/types/game/types';
import type { ISize } from '@ctor-game/shared/types/geometry/types';
import { getAdjacentPositions } from '../utils/geometry';
import { getOpponent } from '../utils/game';

/**
 * Board size and validation constants
 */
const BOARD_SIZE = 8;
const MIN_ADJACENT_FOR_REPLACE = 2;

/**
 * Custom type for validation result of replacement operation
 */
interface IReplaceValidation {
  isValid: boolean;
  replacements: [number, number][];
  message: string;
}

/**
 * Game logic implementation
 */
export class GameLogicService {
  /**
   * Создает начальное состояние игры
   * Первый ход в игре особенный - только 1 операция размещения
   * @returns Начальное состояние игры
   */
  static createInitialState(): IGameState {
    // Создаем пустую доску с null значениями
    const board = Array(BOARD_SIZE)
      .fill(null)
      .map(() => Object.freeze(Array(BOARD_SIZE).fill(null)));

    // Определяем размер доски и создаем начальные очки
    const size: ISize = { width: BOARD_SIZE, height: BOARD_SIZE };
    const scores: IGameScores = { player1: 0, player2: 0 };

    // Формируем начальное состояние
    return {
      id: crypto.randomUUID(),
      board: Object.freeze(board),
      size,
      currentPlayer: 1 as PlayerNumber,
      status: 'playing',
      scores,
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
  static isValidMove(state: IGameState, move: IGameMove, playerNumber: PlayerNumber): boolean {
    // Нельзя делать ходы, если игра завершена
    if (state.status === 'finished') {
      return false;
    }

    const { type, position } = move;
    const { x, y } = position;
    const { width, height } = state.size;

    // Проверяем базовые условия
    if (x < 0 || x >= width || y < 0 || y >= height) {
      return false;
    }

    if (type === 'place') {
      // Для операции размещения проверяем, свободна ли клетка
      return state.board[y][x] === null;
    } else if (type === 'replace') {
      // Для операции замены проверяем:
      // 1. Находится ли в клетке фишка противника
      // 2. Достаточно ли своих фишек вокруг
      return (
        state.board[y][x] === getOpponent(playerNumber) &&
        this.validateReplace(state.board, state.size, position, playerNumber).isValid
      );
    }

    return false;
  }

  /**
   * Проверяет возможность замены фишки
   */
  static validateReplace(
    board: ReadonlyArray<ReadonlyArray<number | null>>,
    size: ISize,
    position: IPosition,
    playerNumber: PlayerNumber
  ): IReplaceValidation {
    const startTime = Date.now();
    const adjacentPositions = getAdjacentPositions(position, size);
    const playerPieces = adjacentPositions.filter(
      (pos: IPosition) => board[pos.y][pos.x] === playerNumber
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
   * Применяет ход к текущему состоянию игры
   */
  static applyMove(state: IGameState, move: IGameMove, playerNumber: PlayerNumber): IGameState {
    const startTime = Date.now();
    logger.game.move('applying', move, {
      playerNumber,
      state: {
        currentPlayer: state.currentPlayer
      }
    });

    let newBoard = state.board;
    const { type, position } = move;
    const { x, y } = position;

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
            const { x: replaceX, y: replaceY } = replaceMove.position;
            newBoard = update2DArrayValue(newBoard, replaceX, replaceY, playerNumber);
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
  static getAvailableReplaces(state: IGameState, playerNumber: PlayerNumber): IGameMove[] {
    const availableReplaces: IGameMove[] = [];
    const { width, height } = state.size;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Проверяем только фишки противника
        if (state.board[y][x] === getOpponent(playerNumber)) {
          const position: IPosition = { x, y };
          const candidate = this.validateReplace(state.board, state.size, position, playerNumber);
          if (candidate.isValid) {
            availableReplaces.push({
              type: 'replace',
              position,
              player: playerNumber
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
  private static checkGameOver(board: ReadonlyArray<ReadonlyArray<number | null>>): boolean {
    // Игра заканчивается, когда все клетки заняты
    return board.every(row => row.every(cell => cell !== null));
  }

  /**
   * Вычисляет текущий счет игры
   */
  private static calculateScores(board: ReadonlyArray<ReadonlyArray<number | null>>): IGameScores {
    let player1Count = 0;
    let player2Count = 0;

    for (const row of board) {
      for (const cell of row) {
        if (cell === 1) player1Count++;
        else if (cell === 2) player2Count++;
      }
    }

    return {
      player1: player1Count,
      player2: player2Count
    };
  }
}