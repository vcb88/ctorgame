// Интерфейс игрока
export interface IPlayer {
  id: string;
  number: number;  // 0 или 1
}

// Константы игры
export const BOARD_SIZE = 10;
export const MIN_ADJACENT_FOR_REPLACE = 5;
export const MAX_PLACE_OPERATIONS = 2;

// Типы операций
export enum OperationType {
  PLACE = 'place',
  REPLACE = 'replace'
}

import { IPosition, IBoard } from './coordinates';

// Расширенный тип хода
export interface IGameMove {
  type: OperationType;
  position: IPosition;
}

// Интерфейс для отслеживания хода
export interface ITurnState {
  placeOperationsLeft: number;
  moves: IGameMove[];
}

// Расширенное состояние игры
export interface IGameState {
  board: IBoard;
  gameOver: boolean;
  winner: number | null;
  currentTurn: ITurnState;
  scores: {
    player1: number;
    player2: number;
  };
  isFirstTurn: boolean; // Флаг для отслеживания первого хода в игре
}

// Расширенный тип для валидации замены
export interface IReplaceValidation {
  isValid: boolean;
  adjacentCount: number;
  positions: IPosition[];
}

// Направления для проверки соседних клеток
export const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],          [0, 1],
  [1, -1],  [1, 0],  [1, 1]
] as const;

// Получение координат всех соседних клеток с учетом тороидальности
export const getAdjacentPositions = (pos: IPosition, board: IBoard): IPosition[] => {
  return DIRECTIONS.map(([dx, dy]) => ({
    x: ((pos.x + dx + board.size.width) % board.size.width),
    y: ((pos.y + dy + board.size.height) % board.size.height)
  }));
};