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
export type Position = [number, number];
export type Move = {
  pos: Position;
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
  pos?: Position;
  p?: PlayerType;
  from?: Position;
  to?: Position;
};

export type CellProps = {
  pos: Position;
  v: number;
  s: number;
};

export type GameEndResult = {
  over: boolean;
  winner?: string;
};