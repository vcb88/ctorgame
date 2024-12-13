import { Board, P, A, GameState, GameAction,  GRID_WIDTH, GRID_HEIGHT  } from '@/types';
import { replace } from '@/utils/board';

export const initialState: GameState = {
  board: Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(P.N)) as Board,
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