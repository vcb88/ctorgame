import { Board, P } from '@/types';
import { GRID_WIDTH, GRID_HEIGHT } from '@/constants';

export const nX = (x: number): number => {
  while (x < 0) x += GRID_WIDTH;
  return x % GRID_WIDTH;
};

export const nY = (y: number): number => {
  while (y < 0) y += GRID_HEIGHT;
  return y % GRID_HEIGHT;
};

export const checkEnd = (b: Board) => {
  const e = b.flat().filter(c => c === P.N).length;
  if (e === 0) {
    const a = b.flat().filter(c => c === P.A).length;
    const b2 = b.flat().filter(c => c === P.B).length;
    return { over: true, winner: a > b2 ? 'Player 1' : b2 > a ? 'Player 2' : 'Draw' };
  }
  return { over: false };
};

export const replace = (b: Board, max = 10): Board => {
  let r = b.map(r => [...r]);
  let chg = true;
  let i = 0;

  while (chg && i < max) {
    chg = false;
    for (let p of [P.A, P.B])
      for (let x = 0; x < GRID_WIDTH; x++)
        for (let y = 0; y < GRID_HEIGHT; y++)
          if (r[x][y] === (p === P.A ? P.B : P.A)) {
            let c = 0;
            for (let dx = -1; dx <= 1; dx++)
              for (let dy = -1; dy <= 1; dy++)
                if (dx || dy)
                  if (r[nX(x + dx)][nY(y + dy)] === p)
                    c++;
            if (c >= 5) {
              r[x][y] = p;
              chg = true;
            }
          }
    i++;
  }
  return r;
};

export const createEmptyBoard = (): Board => 
  Array(GRID_WIDTH).fill(null).map(() => Array(GRID_HEIGHT).fill(P.N));