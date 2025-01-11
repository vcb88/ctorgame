import {
  IGameState,
  IGameMove,
  OperationType,
  BOARD_SIZE,
  MIN_ADJACENT_FOR_REPLACE,
  MAX_PLACE_OPERATIONS,
  IPosition,
  IBoard,
  Player,
  GameOutcome,
  getOpponent,
  normalizePosition,
  getAdjacentPositions,
  IReplaceValidation,
  IScores
} from '../shared';

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
        moves: []
      },
      currentPlayer: Player.First,
      scores: {
        [Player.First]: 0,
        [Player.Second]: 0
      } as IScores,
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
  static isValidMove(state: IGameState, move: IGameMove, playerNumber: Player): boolean {
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
        state.board.cells[y][x] === null &&
        // Проверяем, что на первом ходу не пытаемся сделать больше одной операции
        (!state.isFirstTurn || state.currentTurn.moves.length < 1)
      );
    } else if (type === OperationType.REPLACE) {
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
    playerNumber: Player
  ): IReplaceValidation {
    const adjacentPositions = getAdjacentPositions(position, board);
    const playerPieces = adjacentPositions.filter(pos => 
      board.cells[pos.y][pos.x] === playerNumber
    );
    
    return {
      position,
      isValid: playerPieces.length >= MIN_ADJACENT_FOR_REPLACE,
      adjacentCount: playerPieces.length,
      adjacentPositions: playerPieces
    };
  }

  /**
   * Применяет ход к текущему состоянию игры
   */
  static applyMove(state: IGameState, move: IGameMove, playerNumber: Player): IGameState {
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
        newState.currentTurn.moves = [];
      }

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
  static getAvailableReplaces(state: IGameState, playerNumber: Player): IGameMove[] {
    const availableReplaces: IGameMove[] = [];
    const { width, height } = state.board.size;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Проверяем только фишки противника
        if (state.board.cells[y][x] === getOpponent(playerNumber)) {
          const position: IPosition = { x, y };
          const candidate = this.validateReplace(state.board, position, playerNumber);
          if (candidate.isValid) {
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

    state.scores[Player.First] = firstPlayerCount;
    state.scores[Player.Second] = secondPlayerCount;
  }

  /**
   * Проверяет, закончилась ли игра
   */
  private static checkGameOver(board: IBoard): boolean {
    // Игра заканчивается, когда все клетки заняты
    return board.cells.every(row => row.every(cell => cell !== null));
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