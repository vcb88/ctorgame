import { Board, P, Move } from '@/types';
import { GRID_WIDTH, GRID_HEIGHT } from '@/constants';
import { nX, nY } from '@/utils/board';

export const AI = {
  findMove: (b: Board, p: number): Move | null => {
    const moves: Move[] = [];
    
    // Проверяем все возможные ходы
    for (let x = 0; x < GRID_WIDTH; x++) {
      for (let y = 0; y < GRID_HEIGHT; y++) {
        if (b[x][y] === P.N) {
          let t = b.map(r => [...r]);
          t[x][y] = p;
          moves.push({ x, y, score: AI.eval(b, t, x, y, p) });
        }
      }
    }
    
    return moves.length ? moves.reduce((max, m) => (m.score||0) > (max.score||0) ? m : max) : null;
  },

  evalDanger: (b: Board, x: number, y: number, p: number): number => {
    const op = p === P.A ? P.B : P.A;
    let cnt = 0;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx || dy) {
          if (b[nX(x + dx)][nY(y + dy)] === op) {
            cnt++;
          }
        }
      }
    }
    return cnt >= 3 ? 20 + cnt * 5 : 0;
  },

  evalGroup: (b: Board, x: number, y: number, p: number): number => {
    let own = 0, emp = 0;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx || dy) {
          const v = b[nX(x + dx)][nY(y + dy)];
          if (v === p) own++;
          else if (v === P.N) emp++;
        }
      }
    }
    return own >= 2 ? own * 10 + emp * 2 : 0;
  },

  evalBlock: (b: Board, x: number, y: number, p: number): number => {
    const op = p === P.A ? P.B : P.A;
    let s = 0;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if ((dx || dy) && b[nX(x + dx)][nY(y + dy)] === op) {
          let c = 0;
          for (let dx2 = -1; dx2 <= 1; dx2++) {
            for (let dy2 = -1; dy2 <= 1; dy2++) {
              if (dx2 || dy2) {
                if (b[nX(x + dx + dx2)][nY(y + dy + dy2)] === op) {
                  c++;
                }
              }
            }
          }
          if (c >= 3) s += 15 + c * 3;
        }
      }
    }
    return s;
  },

  eval: (ob: Board, nb: Board, x: number, y: number, p: number): number => {
    let tr = 0, rp = 0, mb = 0;
    
    // Оцениваем территорию
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        if (Math.abs(dx) + Math.abs(dy) <= 2) {
          if (nb[nX(x + dx)][nY(y + dy)] === P.N) {
            tr++;
          }
        }
      }
    }
    
    // Оцениваем окружение
    let own = 0;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx || dy) {
          const v = nb[nX(x + dx)][nY(y + dy)];
          if (v === p) own++;
          if (v === P.N) mb++;
        }
      }
    }
    
    if (own >= 3) rp += 5;
    if (own >= 4) rp += 10;

    const dg = AI.evalDanger(ob, x, y, p);
    const pt = AI.evalGroup(ob, x, y, p);
    const bl = AI.evalBlock(ob, x, y, p);
    
    const c = {
      t: tr * 1.5,
      r: rp * 1.2,
      m: mb * 0.8,
      d: dg * 2.0,
      p: pt * 1.5,
      b: bl * 1.8
    };

    const tot = Object.values(c).reduce((a, b) => a + b, 0);
    if (tot > 50) console.log(`Eval(${x},${y}):`, {...c, tot});
    return tot;
  }
};