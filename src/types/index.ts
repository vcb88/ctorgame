import { GRID_WIDTH, GRID_HEIGHT } from '@/constants';

export { GRID_WIDTH, GRID_HEIGHT };
export * from './multiplayer';

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

export type Board = number[][];
export type Position = { x: number; y: number };
export type Move = Position & { 
  score?: number;
  s?: number;
};

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

export interface CellProps {
  x: number;
  y: number;
  v: number;
  s: number;
}

export interface GameEndResult {
  over: boolean;
  winner?: string;
}