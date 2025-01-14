import { logger } from '../utils/logger.js';
// Game state and types
import type {
  IGameState,
  IBoard,
  IScores,
  ITurnState,
  GameMove,
  PlayerNumber,
  OperationType,
  GameStatus
} from '@ctor-game/shared/types/game/types.js';

// Geometry types
import type { IPosition } from '@ctor-game/shared/types/geometry/types.js';

// Constants
const BOARD_SIZE = 8;
const MIN_ADJACENT_FOR_REPLACE = 2;
const MAX_PLACE_OPERATIONS = 2;

// Utils
import { getAdjacentPositions } from '@ctor-game/shared/utils/coordinates.js';
import {
  getOpponent,
  createScores
} from '@ctor-game/shared/utils/game.js';

// Custom type for validation result
interface IReplaceValidation {
  isValid: boolean;
  replacements: [number, number][];
  message: string;
}

export class GameLogicService {
  /**
   * Создает начальное состояние игры
   * Первый ход в игре особенный - только 1 операция размещения
   * @returns Начальное состояние игры
   */
  static createInitialState(): IGameState {
    return {
      board: {
        cells: Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)),
        size: { width: BOARD_SIZE, height: BOARD_SIZE }
      },
      gameOver: false,
      winner: null,
      currentTurn: {
        placeOperationsLeft: 1, // Первый ход - только одна операция
        replaceOperationsLeft: 0, // В первый ход нет операций замены
        moves: [],
        count: 1
      },
      currentPlayer: 1 as PlayerNumber, // Changed from Player.First to 1
      scores: createScores(0, 0),
      isFirstTurn: true, // Флаг первого хода (только 1 операция размещения)
      turnNumber: 1 // Overall game turn counter
    };
  }

  /**
   * Проверяет, является ли ход допустимым
   * @param state Текущее состояние игры
   * @param move Проверяемый ход
   * @param playerNumber Номер игрока, делающего ход
   * @returns true если ход допустим
   */
  static isValidMove(state: IGameState, move: GameMove, playerNumber: PlayerNumber): boolean {
    // Нельзя делать ходы, если игра завершена
    if (state.gameOver) {
      return false;
    }

    const { type, position } = move;
    const { x, y } = position;
    const { width, height } = state.board.size;

    // Проверяем базовые условия
    if (x < 0 || x >= width || y < 0 || y >= height) {
      return false;
    }

    if (type === 'place') { // Changed from OperationType.PLACE
      // Для операции размещения проверяем:
      // 1. Остались ли операции размещения
      // 2. Свободна ли клетка
      // 3. На первом ходу можно сделать только одну операцию
      return (
        state.currentTurn.placeOperationsLeft > 0 &&
        state.board.cells[y][x] === null && // Changed from Player.None
        // Проверяем, что на первом ходу не пытаемся сделать больше одной операции
        (!state.isFirstTurn || state.currentTurn.moves.length < 1)
      );
    } else if (type === 'replace') { // Changed from OperationType.REPLACE
      // Для операции замены проверяем:
      // 1. Находится ли в клетке фишка противника
      // 2. Достаточно ли своих фишек вокруг
      return (
        state.board.cells[y][x] === getOpponent(playerNumber) &&
        this.validateReplace(state.board, position, playerNumber).isValid
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
    playerNumber: PlayerNumber
  ): IReplaceValidation {
    const startTime = Date.now();
    const adjacentPositions = getAdjacentPositions(position, board);
    const playerPieces = adjacentPositions.filter((pos: IPosition) => 
      board.cells[pos.y][pos.x] === playerNumber
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
  static applyMove(state: IGameState, move: GameMove, playerNumber: PlayerNumber): IGameState {
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

    if (type === 'place') { // Changed from OperationType.PLACE
      // Размещаем фишку
      newState.board.cells[y][x] = playerNumber;
      
      // Создаем новое состояние хода
      const newTurnState: ITurnState = {
        ...newState.currentTurn,
        placeOperationsLeft: newState.currentTurn.placeOperationsLeft - 1
      };
      newState.currentTurn = newTurnState;
      
      // Если это был первый ход в игре, обновляем флаг и устанавливаем количество операций для следующего хода
      if (state.isFirstTurn) {
        newState.isFirstTurn = false;
      }
      
      // Проверяем окончание хода (нет операций или первый ход завершен)
      if (newTurnState.placeOperationsLeft === 0) {
        newState.currentPlayer = getOpponent(newState.currentPlayer);
        newState.turnNumber++; // Increment global turn counter
        newState.currentTurn = {
          placeOperationsLeft: newState.isFirstTurn ? 1 : MAX_PLACE_OPERATIONS,
          replaceOperationsLeft: 0,
          moves: [],
          count: 1 // Reset count for the new player's turn
        };
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
    newState.currentTurn = {
      ...newState.currentTurn,
      moves: [...newState.currentTurn.moves, move]
    };

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
  static getAvailableReplaces(state: IGameState, playerNumber: PlayerNumber): GameMove[] {
    const availableReplaces: GameMove[] = [];
    const { width, height } = state.board.size;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Проверяем только фишки противника
        if (state.board.cells[y][x] === getOpponent(playerNumber)) {
          const position: IPosition = { x, y };
          const candidate = this.validateReplace(state.board, position, playerNumber);
          if (candidate.isValid) {
            availableReplaces.push({
              type: 'replace' as OperationType, // Changed from OperationType.REPLACE
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
        if (cell === 1) firstPlayerCount++; // Changed from Player.First
        else if (cell === 2) secondPlayerCount++; // Changed from Player.Second
      }
    }

    state.scores = createScores(firstPlayerCount, secondPlayerCount);
  }

  /**
   * Проверяет, закончилась ли игра
   */
  private static checkGameOver(board: IBoard): boolean {
    // Игра заканчивается, когда все клетки заняты
    return board.cells.every((row: (PlayerNumber | null)[]) => 
      row.every((cell: PlayerNumber | null) => cell !== null)
    );
  }

  /**
   * Определяет победителя по очкам
   */
  private static determineWinner(scores: IScores): PlayerNumber | null {
    if (scores[1] > scores[2]) return 1; // Changed from Player.First
    if (scores[2] > scores[1]) return 2; // Changed from Player.Second
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
        cells: state.board.cells.map((row: (PlayerNumber | null)[]): (PlayerNumber | null)[] => [...row]),
        size: { ...state.board.size }
      },
      gameOver: state.gameOver,
      winner: state.winner,
      currentTurn: {
        placeOperationsLeft: state.currentTurn.placeOperationsLeft,
        replaceOperationsLeft: state.currentTurn.replaceOperationsLeft,
        moves: [...state.currentTurn.moves],
        count: state.currentTurn.count
      } as ITurnState,
      currentPlayer: state.currentPlayer,
      scores: createScores(
        state.scores[1], // Changed from Player.First
        state.scores[2] // Changed from Player.Second
      ),
      isFirstTurn: state.isFirstTurn,
      turnNumber: state.turnNumber
    };
  }
}