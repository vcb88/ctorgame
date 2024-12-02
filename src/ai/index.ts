import { n } from '../utils/board';

import { S, P, O, Board, Move } from '@/types';


export const AI = {
  findMove: (b: Board, p: number, op: string): Move | null => {
    const ms: Move[] = [];
    if (op === O.PL) {
      for (let x = 0; x < S; x++) {
        for (let y = 0; y < S; y++) {
          if (b[x][y] === P.N) {
            const t = b.map(r => [...r]);
            t[x][y] = p;
            const evalScore = AI.eval(b, t, x, y, p);
            ms.push({ x, y, s: evalScore  });
          }
        }
      }
      ms.sort((a, b) => (b.s||0) - (a.s||0) );
      console.log('Top moves:', ms.slice(0, 3));
    }
    return ms.length ? ms[0] : null;
  },

  evalDanger: (b: Board, x: number, y: number, p: number): number => {
    const op = p === P.A ? P.B : P.A;
    let cnt = 0;
    for (let dx = -1; dx <= 1; dx++)
      for (let dy = -1; dy <= 1; dy++)
        if (dx || dy)
          if (b[n(x + dx)][n(y + dy)] === op)
            cnt++;
    return cnt >= 3 ? 20 + cnt * 5 : 0;
  },

  evalGroup: (b: Board, x: number, y: number, p: number): number => {
    let own = 0, emp = 0;
    for (let dx = -1; dx <= 1; dx++)
      for (let dy = -1; dy <= 1; dy++)
        if (dx || dy) {
          const v = b[n(x + dx)][n(y + dy)];
          if (v === p) own++;
          else if (v === P.N) emp++;
        }
    return own >= 2 ? own * 10 + emp * 2 : 0;
  },

  evalBlock: (b: Board, x: number, y: number, p: number): number => {
    const op = p === P.A ? P.B : P.A;
    let s = 0;
    for (let dx = -1; dx <= 1; dx++)
      for (let dy = -1; dy <= 1; dy++)
        if (dx || dy && b[n(x + dx)][n(y + dy)] === op) {
          let c = 0;
          for (let dx2 = -1; dx2 <= 1; dx2++)
            for (let dy2 = -1; dy2 <= 1; dy2++)
              if (dx2 || dy2)
                if (b[n(x + dx + dx2)][n(y + dy + dy2)] === op)
                  c++;
          if (c >= 3) s += 15 + c * 3;
        }
    return s;
  },

  eval: (ob: Board, nb: Board, x: number, y: number, p: number): number => {
    let tr = 0, rp = 0, mb = 0;
    
    for (let dx = -2; dx <= 2; dx++)
      for (let dy = -2; dy <= 2; dy++)
        if (Math.abs(dx) + Math.abs(dy) <= 2)
          if (nb[n(x + dx)][n(y + dy)] === P.N)
            tr++;
    
    let own = 0;
    for (let dx = -1; dx <= 1; dx++)
      for (let dy = -1; dy <= 1; dy++)
        if (dx || dy) {
          const v = nb[n(x + dx)][n(y + dy)];
          if (v === p) own++;
          if (v === P.N) mb++;
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
