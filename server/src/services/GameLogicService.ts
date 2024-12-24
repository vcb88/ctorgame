import {
  IGameState,
  IGameMove,
  OperationType,
  BOARD_SIZE,
  MIN_ADJACENT_FOR_REPLACE,
  normalizePosition,
  getAdjacentPositions,
  IReplaceValidation
} from '@ctor-game/shared/types';

export class GameLogicService {
  /**
   * Создает начальное состояние игры
   */
  static createInitialState(): IGameState {
    return {
      board: Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)),
      gameOver: false,
      winner: null,
      currentTurn: {
        placeOperationsLeft: 2,
        moves: []
      },
      scores: {
        player1: 0,
        player2: 0
      }
    };
  }

  /**
   * Проверяет, является ли ход допустимым
   */
  static isValidMove(state: IGameState, move: IGameMove, playerNumber: number): boolean {
    const { type, position } = move;
    const { row, col } = position;

    // Проверяем базовые условия
    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
      return false;
    }

    if (type === OperationType.PLACE) {
      // Для операции размещения проверяем:
      // 1. Остались ли операции размещения
      // 2. Свободна ли клетка
      return (
        state.currentTurn.placeOperationsLeft > 0 &&
        state.board[row][col] === null
      );
    } else if (type === OperationType.REPLACE) {
      // Для операции замены проверяем:
      // 1. Находится ли в клетке фишка противника
      // 2. Достаточно ли своих фишек вокруг
      return (
        state.board[row][col] === (playerNumber === 0 ? 1 : 0) &&
        this.validateReplace(state.board, row, col, playerNumber).isValid
      );
    }

    return false;
  }

  /**
   * Проверяет возможность замены фишки
   */
  static validateReplace(
    board: (number | null)[][],
    row: number,
    col: number,
    playerNumber: number
  ): IReplaceValidation {
    const adjacentPositions = getAdjacentPositions(row, col);
    const playerPieces = adjacentPositions.filter(pos => 
      board[pos.row][pos.col] === playerNumber
    );

    return {
      isValid: playerPieces.length >= MIN_ADJACENT_FOR_REPLACE,
      adjacentCount: playerPieces.length,
      positions: playerPieces
    };
  }

  /**
   * Применяет ход к текущему состоянию игры
   */
  static applyMove(state: IGameState, move: IGameMove, playerNumber: number): IGameState {
    const newState = this.cloneGameState(state);
    const { type, position } = move;
    const { row, col } = position;

    if (type === OperationType.PLACE) {
      // Размещаем фишку
      newState.board[row][col] = playerNumber;
      newState.currentTurn.placeOperationsLeft--;
    } else if (type === OperationType.REPLACE) {
      // Заменяем фишку противника
      newState.board[row][col] = playerNumber;
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

    return newState;
  }

  /**
   * Проверяет доступные замены после размещения фишки
   */
  static getAvailableReplaces(state: IGameState, playerNumber: number): IGameMove[] {
    const availableReplaces: IGameMove[] = [];

    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        // Проверяем только фишки противника
        if (state.board[row][col] === (playerNumber === 0 ? 1 : 0)) {
          const validation = this.validateReplace(state.board, row, col, playerNumber);
          if (validation.isValid) {
            availableReplaces.push({
              type: OperationType.REPLACE,
              position: { row, col }
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
    let player1Count = 0;
    let player2Count = 0;

    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (state.board[row][col] === 0) player1Count++;
        else if (state.board[row][col] === 1) player2Count++;
      }
    }

    state.scores.player1 = player1Count;
    state.scores.player2 = player2Count;
  }

  /**
   * Проверяет, закончилась ли игра
   */
  private static checkGameOver(board: (number | null)[][]): boolean {
    // Игра заканчивается, когда все клетки заняты
    return board.every(row => row.every(cell => cell !== null));
  }

  /**
   * Определяет победителя по очкам
   */
  private static determineWinner(scores: { player1: number; player2: number }): number | null {
    if (scores.player1 > scores.player2) return 0;
    if (scores.player2 > scores.player1) return 1;
    return null; // Ничья
  }

  /**
   * Создает глубокую копию состояния игры
   */
  private static cloneGameState(state: IGameState): IGameState {
    return {
      board: state.board.map(row => [...row]),
      gameOver: state.gameOver,
      winner: state.winner,
      currentTurn: {
        placeOperationsLeft: state.currentTurn.placeOperationsLeft,
        moves: [...state.currentTurn.moves]
      },
      scores: {
        player1: state.scores.player1,
        player2: state.scores.player2
      }
    };
  }
}