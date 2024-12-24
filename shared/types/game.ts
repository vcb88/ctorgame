// Константы игры
export const BOARD_SIZE = 10;
export const MIN_ADJACENT_FOR_REPLACE = 5;
export const MAX_PLACE_OPERATIONS = 2;

// Типы операций
export enum OperationType {
  PLACE = 'place',
  REPLACE = 'replace'
}

// Расширенный тип хода
export interface IGameMove {
  type: OperationType;
  position: {
    row: number;
    col: number;
  };
}

// Интерфейс для отслеживания хода
export interface ITurnState {
  placeOperationsLeft: number;
  moves: IGameMove[];
}

// Расширенное состояние игры
export interface IGameState {
  board: (number | null)[][];
  gameOver: boolean;
  winner: number | null;
  currentTurn: ITurnState;
  scores: {
    player1: number;
    player2: number;
  };
}

// Расширенный тип для валидации замены
export interface IReplaceValidation {
  isValid: boolean;
  adjacentCount: number;
  positions: Array<{ row: number; col: number }>;
}

// Направления для проверки соседних клеток
export const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],          [0, 1],
  [1, -1],  [1, 0],  [1, 1]
] as const;

// Функции для работы с тороидальной доской
export const normalizePosition = (pos: number): number => {
  return ((pos % BOARD_SIZE) + BOARD_SIZE) % BOARD_SIZE;
};

// Получение координат всех соседних клеток с учетом тороидальности
export const getAdjacentPositions = (row: number, col: number): Array<{ row: number; col: number }> => {
  return DIRECTIONS.map(([dRow, dCol]) => ({
    row: normalizePosition(row + dRow),
    col: normalizePosition(col + dCol)
  }));
};