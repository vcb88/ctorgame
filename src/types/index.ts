import { S } from '@/constants';
export { S };

// Константы и их типы
export const P = { N: 0, A: 1, B: 2 } as const;
export type PlayerType = typeof P[keyof typeof P];

export const O = { PL: 'place', MV: 'move' } as const;
export type OperationType = typeof O[keyof typeof O];

export const A = {
  PL: 'PL',
  MV: 'MV',
  RP: 'RP',
  ET: 'ET'
} as const;
export type ActionType = typeof A[keyof typeof A];

// Базовые типы
export type Board = number[][];
export type Position = { x: number; y: number };
export type Move = Position & { 
  score?: number;  // Для AI.findMove
  s?: number;      // Для тестов
};  // Обновили для соответствия AI.findMove

// Типы состояний игры
export type GameState = {
  board: Board;
  p: PlayerType;
  ops: number;
};

export type GameAction = {
  type: ActionType;
  x?: number;
  y?: number;
  p?: PlayerType;
  fx?: number;
  fy?: number;
  tx?: number;
  ty?: number;
};

// Типы для компонентов
export interface CellProps {
  x: number;
  y: number;
  v: number;
  s: number;
}

// Типы для функций
export interface GameEndResult {
  over: boolean;
  winner?: string;
}