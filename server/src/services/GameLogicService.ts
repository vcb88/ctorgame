import {
  IGameState,
  IGameMove,
  OperationType,
  BOARD_SIZE,
  MIN_ADJACENT_FOR_REPLACE,
  IPosition,
  IBoard,
  normalizePosition,
  getAdjacentPositions,
  IReplaceValidation
} from '@ctor-game/shared';

export class GameLogicService {
  /**
   * Создает начальное состояние игры
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
        placeOperationsLeft: 1, // Первый игрок начинает с одной операции
        moves: []
      },
      currentPlayer: 0, // Добавляем currentPlayer (0 - первый игрок)
      scores: {
        player1: 0,
        player2: 0
      },
      isFirstTurn: true // Добавляем флаг первого хода
    };
  }

  /**
   * Проверяет, является ли ход допустимым
   */
  static isValidMove(state: IGameState, move: IGameMove, playerNumber: number): boolean {
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
      return (
        state.currentTurn.placeOperationsLeft > 0 &&
        state.board.cells[y][x] === null
      );
    } else if (type === OperationType.REPLACE) {
      // Для операции замены проверяем:
      // 1. Находится ли в клетке фишка противника
      // 2. Достаточно ли своих фишек вокруг
      return (
        state.board.cells[y][x] === (playerNumber === 0 ? 1 : 0) &&
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
    playerNumber: number
  ): IReplaceValidation {
    const adjacentPositions = getAdjacentPositions(position, board);
    const playerPieces = adjacentPositions.filter((pos: IPosition) => 
      board.cells[pos.y][pos.x] === playerNumber
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
    const { x, y } = position;

    if (type === OperationType.PLACE) {
      // Размещаем фишку
      newState.board.cells[y][x] = playerNumber;
      newState.currentTurn.placeOperationsLeft--;
      
      // Автоматически выполняем все возможные замены
      let replacementsFound;
      do {
        replacementsFound = false;
        const availableReplaces = this.getAvailableReplaces(newState, playerNumber);
        
        if (availableReplaces.length > 0) {
          replacementsFound = true;
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

    return newState;
  }

  /**
   * Проверяет доступные замены после размещения фишки
   */
  static getAvailableReplaces(state: IGameState, playerNumber: number): IGameMove[] {
    const availableReplaces: IGameMove[] = [];
    const { width, height } = state.board.size;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Проверяем только фишки противника
        if (state.board.cells[y][x] === (playerNumber === 0 ? 1 : 0)) {
          const position: IPosition = { x, y };
          const validation = this.validateReplace(state.board, position, playerNumber);
          if (validation.isValid) {
            availableReplaces.push({
              type: OperationType.REPLACE,
              position
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
    const { width, height } = state.board.size;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (state.board.cells[y][x] === 0) player1Count++;
        else if (state.board.cells[y][x] === 1) player2Count++;
      }
    }

    state.scores.player1 = player1Count;
    state.scores.player2 = player2Count;
  }

  /**
   * Проверяет, закончилась ли игра
   */
  private static checkGameOver(board: IBoard): boolean {
    // Игра заканчивается, когда все клетки заняты
    return board.cells.every((row: (number | null)[]) => row.every((cell: number | null) => cell !== null));
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
      board: {
        cells: state.board.cells.map((row: number[]) => [...row]),
        size: { ...state.board.size }
      },
      gameOver: state.gameOver,
      winner: state.winner,
      currentTurn: {
        placeOperationsLeft: state.currentTurn.placeOperationsLeft,
        moves: [...state.currentTurn.moves]
      },
      currentPlayer: state.currentPlayer,
      scores: {
        player1: state.scores.player1,
        player2: state.scores.player2
      },
      isFirstTurn: state.isFirstTurn
    };
  }
}