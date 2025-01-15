import { logger } from '../utils/logger.js';
import { create2DArrayCopy, update2DArrayValue } from '../utils/array.js';
import type { IPosition } from '@ctor-game/shared/types/geometry/types.js';
import type { IGameState } from '../types/game-state.js';
import {
    IGameMove,
    PlayerNumber,
    GameStatus,
    ISize,
    getAdjacentPositions,
    getOpponent,
    createScores
} from '../types/shared.js';

// Constants
const BOARD_SIZE = 8;
const MIN_ADJACENT_FOR_REPLACE = 2;
const MAX_PLACE_OPERATIONS = 2;

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
      id: crypto.randomUUID(),
      board: Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)),
      size: { width: BOARD_SIZE, height: BOARD_SIZE },
      currentPlayer: 1 as PlayerNumber,
      status: 'playing',
      scores: createScores(0, 0),
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
    const playerPieces = adjacentPositions.filter((pos: IPosition) => 
      board[pos.y][pos.x] === playerNumber
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

    const newState = this.cloneGameState(state);
    const { type, position } = move;
    const { x, y } = position;

    if (type === 'place') {
      // Размещаем фишку
      const newBoard = update2DArrayValue(state.board, x, y, playerNumber);
      const updatedState = { ...newState, board: newBoard };

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
            const newBoardAfterReplace = update2DArrayValue(newState.board, replaceX, replaceY, playerNumber);
            newState = { ...newState, board: newBoardAfterReplace };
          }
        }
      } while (replacementsFound);
    }

    // Сохраняем ход
    newState.lastMove = move;

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
   * Обновляет счет в игре
   */
  private static updateScores(state: IGameState): void {
    let firstPlayerCount = 0;
    let secondPlayerCount = 0;
    const { width, height } = state.size;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cell = state.board[y][x];
        if (cell === 1) firstPlayerCount++;
        else if (cell === 2) secondPlayerCount++;
      }
    }

    state.scores = createScores(firstPlayerCount, secondPlayerCount);
  }

  /**
   * Проверяет, закончилась ли игра
   */
  private static checkGameOver(board: ReadonlyArray<ReadonlyArray<number | null>>): boolean {
    // Игра заканчивается, когда все клетки заняты
    return board.every(row => row.every(cell => cell !== null));
  }

  /**
   * Определяет победителя по очкам
   */
  private static determineWinner(scores: IGameScores): PlayerNumber | null {
    if (scores.player1 > scores.player2) return 1;
    if (scores.player2 > scores.player1) return 2;
    return null;
  }

  /**
   * Создает глубокую копию состояния игры
   * Все поля состояния копируются, включая флаг isFirstTurn,
   * который важен для правильной обработки порядка ходов
   */
  private static cloneGameState(state: IGameState): IGameState {
    return {
      id: state.id,
      board: create2DArrayCopy(state.board),
      size: { ...state.size },
      currentPlayer: state.currentPlayer,
      status: state.status,
      scores: createScores(
        state.scores.player1,
        state.scores.player2
      ),
      timestamp: state.timestamp,
      lastMove: state.lastMove
    };
  }
}