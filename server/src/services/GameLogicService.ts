import { logger } from '../utils/logger.js';
// Game state and moves
import {
  IGameState,
  IBoard,
  IScores,
  GameMove,
  Player
} from '@ctor-game/shared/game';

// Base types
import { OperationType, GameOutcome, GamePhase } from '@ctor-game/shared/types/base/enums';
import type { IPosition, IBoardSize } from '@ctor-game/shared/types/base/primitives';

// Constants
import {
  BOARD_SIZE,
  MIN_ADJACENT_FOR_REPLACE,
  MAX_PLACE_OPERATIONS
} from '@ctor-game/shared/types/constants';

// Board utils
import { getAdjacentPositions } from '@ctor-game/shared/utils/board';

// Game validation
import {
  IReplaceValidation
} from '@ctor-game/shared/validation';

// Game utils
import {
  getOpponent,
  getTurnScore,
  createEmptyScores,
  createScores,
  updateScores
} from '@ctor-game/shared/utils';

export class GameLogicService {
  /**
   * Создает начальное состояние игры
   * Первый ход в игре особенный - только 1 операция размещения
   * @returns Начальное состояние игры
   */
  static createInitialState(): IGameState {
    return {
      board: {
        cells: Array(BOARD_SIZE).fill(Player.None).map(() => Array(BOARD_SIZE).fill(Player.None)),
        size: { width: BOARD_SIZE, height: BOARD_SIZE }
      },
      gameOver: false,
      winner: null,
      currentTurn: {
        placeOperationsLeft: 1, // Первый ход - только одна операция
        replaceOperationsLeft: 0, // В первый ход нет операций замены
        moves: [],
        count: 0
      },
      currentPlayer: Player.First,
      scores: createEmptyScores(),
      isFirstTurn: true // Флаг первого хода (только 1 операция размещения)
    };
  }

  /**
   * Проверяет, является ли ход допустимым
   */
  /**
   * Проверяет, является ли ход допустимым
   * @param state Текущее состояние игры
   * @param move Проверяемый ход
   * @param playerNumber Номер игрока, делающего ход
   * @returns true если ход допустим
   */
  static isValidMove(state: IGameState, move: GameMove, playerNumber: Player): boolean {
    const { type, position } = move;
    const { x, y } = position;
    const { width, height } = state.board.size;

    // Проверяем базовые условия
    if (x < 0 || x >= width || y < 0 || y >= height) {
      return false;
    }

    if (type === OperationType.PLACE) {
      // Для операции размещения проверяем:
      // 1. Остались ли операции размещения
      // 2. Свободна ли клетка
      // 3. На первом ходу можно сделать только одну операцию
      return (
        state.currentTurn.placeOperationsLeft > 0 &&
        state.board.cells[y][x] === Player.None &&
        // Проверяем, что на первом ходу не пытаемся сделать больше одной операции
        (!state.isFirstTurn || state.currentTurn.moves.length < 1)
      );
    } else if (type === OperationType.REPLACE) {
      // Для операции замены проверяем:
      // 1. Находится ли в клетке фишка противника
      // 2. Достаточно ли своих фишек вокруг
      return (
        state.board.cells[y][x] === getOpponent(playerNumber) &&
        this.validateReplace(state.board, position, playerNumber).valid
      );
    }

    return false;
  }

  /**
   * Проверяет возможность замены фишки
   */
  static validateReplace(
    board: IBoard,
    position: IPosition,
    playerNumber: Player
  ): IReplaceValidation {
    const startTime = Date.now();
    const adjacentPositions = getAdjacentPositions(position, board);
    const playerPieces = adjacentPositions.filter(pos => 
      board.cells[pos.y][pos.x] === playerNumber
    );
    
    const validation: IReplaceValidation = {
      valid: playerPieces.length >= MIN_ADJACENT_FOR_REPLACE,
      replacements: playerPieces.map(pos => [pos.x, pos.y]),
      message: playerPieces.length >= MIN_ADJACENT_FOR_REPLACE ? 
        'Valid replacement' : 
        `Not enough adjacent pieces (${playerPieces.length}/${MIN_ADJACENT_FOR_REPLACE})`
    };

    logger.game.validation(validation.valid, 
      validation.valid ? 'valid_replace' : 'invalid_replace', 
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
  static applyMove(state: IGameState, move: GameMove, playerNumber: Player): IGameState {
    const startTime = Date.now();
    logger.game.move('applying', move, {
      playerNumber,
      state: {
        currentPlayer: state.currentPlayer,
        operationsLeft: state.currentTurn.placeOperationsLeft,
        isFirstTurn: state.isFirstTurn
      }
    });

    const newState = this.cloneGameState(state);
    const { type, position } = move;
    const { x, y } = position;

    if (type === OperationType.PLACE) {
      // Размещаем фишку
      newState.board.cells[y][x] = playerNumber;
      newState.currentTurn.placeOperationsLeft--;
      
      // Если это был первый ход в игре, обновляем флаг и устанавливаем количество операций для следующего хода
      if (state.isFirstTurn) {
        newState.isFirstTurn = false;
      }
      
      // Проверяем окончание хода (нет операций или первый ход завершен)
      if (newState.currentTurn.placeOperationsLeft === 0) {
        newState.currentPlayer = getOpponent(newState.currentPlayer);
        newState.currentTurn.placeOperationsLeft = newState.isFirstTurn ? 1 : MAX_PLACE_OPERATIONS;
        newState.currentTurn.replaceOperationsLeft = 0;
        newState.currentTurn.moves = [];
      }

      // Автоматически выполняем все возможные замены
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
            newState.board.cells[replaceY][replaceX] = playerNumber;
          }
        }
      } while (replacementsFound);
    }

    // Добавляем ход в историю
    newState.currentTurn.moves.push(move);

    // Обновляем счет
    this.updateScores(newState);

    // Проверяем окончание игры
    const gameOver = this.checkGameOver(newState.board);
    if (gameOver) {
      newState.gameOver = true;
      newState.winner = this.determineWinner(newState.scores);
    }

    const duration = Date.now() - startTime;
    logger.game.performance('apply_move', duration, {
      move,
      playerNumber,
      replacements: newState.currentTurn.moves.length - state.currentTurn.moves.length - 1,
      gameOver: newState.gameOver,
      winner: newState.winner,
      duration
    });

    return newState;
  }

  /**
   * Проверяет доступные замены после размещения фишки
   */
  static getAvailableReplaces(state: IGameState, playerNumber: Player): GameMove[] {
    const availableReplaces: GameMove[] = [];
    const { width, height } = state.board.size;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Проверяем только фишки противника
        if (state.board.cells[y][x] === getOpponent(playerNumber)) {
          const position: IPosition = { x, y };
          const candidate = this.validateReplace(state.board, position, playerNumber);
          if (candidate.valid) {
            availableReplaces.push({
              type: OperationType.REPLACE,
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
   * Обновляет счет в игре
   */
  private static updateScores(state: IGameState): void {
    let firstPlayerCount = 0;
    let secondPlayerCount = 0;
    const { width, height } = state.board.size;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cell = state.board.cells[y][x];
        if (cell === Player.First) firstPlayerCount++;
        else if (cell === Player.Second) secondPlayerCount++;
      }
    }

    state.scores = createScores(firstPlayerCount, secondPlayerCount);
  }

  /**
   * Проверяет, закончилась ли игра
   */
  private static checkGameOver(board: IBoard): boolean {
    // Игра заканчивается, когда все клетки заняты
    return board.cells.every(row => row.every(cell => cell !== Player.None));
  }

  /**
   * Определяет победителя по очкам
   */
  private static determineWinner(scores: IScores): Player | null {
    if (scores[Player.First] > scores[Player.Second]) return Player.First;
    if (scores[Player.Second] > scores[Player.First]) return Player.Second;
    return null;
  }

  /**
   * Создает глубокую копию состояния игры
   * Все поля состояния копируются, включая флаг isFirstTurn,
   * который важен для правильной обработки порядка ходов
   */
  private static cloneGameState(state: IGameState): IGameState {
    return {
      board: {
        cells: state.board.cells.map(row => [...row]) as number[][],
        size: { ...state.board.size }
      },
      gameOver: state.gameOver,
      winner: state.winner,
      currentTurn: {
        placeOperationsLeft: state.currentTurn.placeOperationsLeft,
        replaceOperationsLeft: state.currentTurn.replaceOperationsLeft,
        moves: [...state.currentTurn.moves]
      },
      currentPlayer: state.currentPlayer,
      scores: {
        [Player.First]: state.scores[Player.First],
        [Player.Second]: state.scores[Player.Second]
      } as IScores,
      isFirstTurn: state.isFirstTurn
    };
  }
}