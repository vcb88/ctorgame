export interface IPosition {
  x: number;
  y: number;
}

export interface IBoardSize {
  width: number;
  height: number;
}

export interface IBoard {
  cells: number[][];
  size: IBoardSize;
}

// Преобразование координат
export function positionToRowCol(pos: IPosition): { row: number; col: number } {
  return { row: pos.y, col: pos.x };
}

export function rowColToPosition(row: number, col: number): IPosition {
  return { x: col, y: row };
}

// Нормализация координат для тороидальной доски
export function normalizePosition(pos: IPosition, size: IBoardSize): IPosition {
  return {
    x: ((pos.x % size.width) + size.width) % size.width,
    y: ((pos.y % size.height) + size.height) % size.height
  };
}