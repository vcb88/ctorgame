import { Board, P, A, GameState, GameAction } from '@/types';
import { replace } from '@/utils/board';

export const initialState: GameState = {
  board: Array(S).fill(null).map(() => Array(S).fill(P.N)) as Board,
  p: P.A,
  ops: 2
};

export const reducer = (s: GameState, a: GameAction): GameState => {
  switch(a.type) {
    case A.PL: {
      if (typeof a.x !== 'number' || typeof a.y !== 'number' || typeof a.p !== 'number') {
        return s; // Возвращаем текущее состояние, если параметры недействительны
      }
      return {
        ...s,
        board: s.board.map((r, x) => 
          x === a.x 
            ? r.map((c, y) => y === a.y ? a.p : c) 
            : [...r]
        ) as Board,
        ops: s.ops - 1
      };
    }
    
    case A.MV: {
      if (
        typeof a.fx !== 'number' || 
        typeof a.fy !== 'number' || 
        typeof a.tx !== 'number' || 
        typeof a.ty !== 'number' || 
        typeof a.p !== 'number'
      ) {
        return s;
      }
      return {
        ...s,
        board: s.board.map((r, x) => {
          if (x === a.fx) return r.map((c, y) => y === a.fy ? P.N : c);
          if (x === a.tx) return r.map((c, y) => y === a.ty ? a.p : c);
          return [...r];
        }) as Board,
        ops: s.ops - 1
      };
    }
    
    case A.RP: 
      return { 
        ...s, 
        board: replace(s.board) as Board 
      };
    
    case A.ET: 
      return { 
        ...s, 
        p: s.p === P.A ? P.B : P.A, 
        ops: 2 
      };
      
    default: 
      return s;
  }
};