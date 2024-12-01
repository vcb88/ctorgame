import React, { useReducer, useState, useMemo, useEffect } from 'react';
import '@/globals.css'

const S = 10, P = { N: 0, A: 1, B: 2 };
const O = { PL: 'place', MV: 'move' };
const A = { PL: 'PLACE', MV: 'MOVE', RP: 'REPLACE', ET: 'END' };
const norm = c => (c + S) % S;

// [Previous game logic remains the same: checkGameEnd, replaceWithLimit, reducer, AI]
const checkGameEnd = (board) => {
  const empty = board.flat().filter(c => c === P.N).length;
  if (empty === 0) {
    const a = board.flat().filter(c => c === P.A).length;
    const b = board.flat().filter(c => c === P.B).length;
    const winner = a > b ? 'Player 1' : b > a ? 'Player 2' : 'Draw';
    return { over: true, winner };
  }
  return { over: false };
};

const replaceWithLimit = (board, max = 10) => {
  let b = board.map(r => [...r]);
  let changed = true;
  let iter = 0;

  while (changed && iter < max) {
    changed = false;
    for (let p of [P.A, P.B]) {
      for (let x = 0; x < S; x++) {
        for (let y = 0; y < S; y++) {
          if (b[x][y] === (p === P.A ? P.B : P.A)) {
            let c = 0;
            for (let dx = -1; dx <= 1; dx++) {
              for (let dy = -1; dy <= 1; dy++) {
                if (dx || dy) {
                  if (b[norm(x + dx)][norm(y + dy)] === p) c++;
                }
              }
            }
            if (c >= 5) {
              b[x][y] = p;
              changed = true;
            }
          }
        }
      }
    }
    iter++;
  }
  return b;
};

const reducer = (s, a) => {
  switch(a.type) {
    case A.PL: return { ...s, board: s.board.map(r => [...r]).map((r, x) => x === a.x && r[a.y] === P.N ? r.map((c, y) => y === a.y ? a.p : c) : r), ops: s.ops - 1 };
    case A.MV: return { ...s, board: s.board.map(r => [...r]).map((r, x) => 
      x === a.fx ? r.map((c, y) => y === a.fy ? P.N : c) :
      x === a.tx ? r.map((c, y) => y === a.ty ? a.p : c) : r
    ), ops: s.ops - 1 };
    case A.RP: return { ...s, board: replaceWithLimit(s.board) };
    case A.ET: return { ...s, p: s.p === P.A ? P.B : P.A, ops: 2 };
    default: return s;
  }
};

const AI = {
  findMove: (b, p, op) => {
    const moves = [];
    if (op === O.PL) {
      for (let x = 0; x < S; x++) {
        for (let y = 0; y < S; y++) {
          if (b[x][y] === P.N) {
            let t = b.map(r => [...r]);
            t[x][y] = p;
            moves.push({ x, y, score: AI.eval(t, x, y, p) });
          }
        }
      }
    }
    return moves.length ? moves.reduce((max, m) => m.score > max.score ? m : max) : null;
  },
  eval: (b, x, y, p) => {
    let terr = 0, repl = 0, mob = 0, pat = 0;
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        if (Math.abs(dx) + Math.abs(dy) <= 2 && b[norm(x+dx)][norm(y+dy)] === P.N) 
          terr++;
      }
    }
    let own = 0;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx || dy) {
          const nx = norm(x+dx), ny = norm(y+dy);
          if (b[nx][ny] === p) own++;
          if (b[nx][ny] === P.N) mob++;
        }
      }
    }
    if (own >= 3) repl += 5;
    if (own >= 4) repl += 10;
    return terr * 1.5 + repl * 1.2 + mob * 0.8 + pat;
  }
};

const CTORGame = () => {
  const init = { board: Array(S).fill().map(() => Array(S).fill(P.N)), p: P.A, ops: 2 };
  const [st, dispatch] = useReducer(reducer, init);
  const [op, setOp] = useState(O.PL);
  const [sel, setSel] = useState(null);
  const [alt, setAlt] = useState(false);
  const [msg, setMsg] = useState('');
  const [map, setMap] = useState(true);
  const [ai, setAi] = useState(true);

  // [Previous useEffect for AI remains the same]
  useEffect(() => {
    const aiTurn = async () => {
      if (!ai || st.p !== P.B || st.ops !== 2) return;
      
      const m1 = AI.findMove(st.board, P.B, O.PL);
      if (!m1) {
        dispatch({type: A.ET});
        return;
      }
      
      let updatedBoard = st.board.map(r => [...r]);
      updatedBoard[m1.x][m1.y] = P.B;
      
      dispatch({type: A.PL, x: m1.x, y: m1.y, p: P.B});
      dispatch({type: A.RP});
      
      updatedBoard = replaceWithLimit(updatedBoard);
      
      await new Promise(r => setTimeout(r, 500));
      
      const m2 = AI.findMove(updatedBoard, P.B, O.PL);
      if (!m2) {
        dispatch({type: A.ET});
        return;
      }
      
      dispatch({type: A.PL, x: m2.x, y: m2.y, p: P.B});
      dispatch({type: A.RP});
      
      await new Promise(r => setTimeout(r, 300));
      dispatch({type: A.ET});
    };

    if (ai && st.p === P.B && st.ops === 2) {
      const timer = setTimeout(aiTurn, 500);
      return () => clearTimeout(timer);
    }
  }, [ai, st.p, st.ops]);

  const click = (x, y) => {
    const gameEnd = checkGameEnd(st.board);
    if (gameEnd.over) {
      setMsg(`Game Over! Winner: ${gameEnd.winner}`);
      setAlt(true);
      return;
    }

    if (ai && st.p === P.B) return;
    if (st.ops <= 0) { 
      dispatch({type: A.ET}); 
      return; 
    }
    
    if (op === O.PL && st.board[x][y] === P.N) {
      dispatch({type: A.PL, x, y, p: st.p});
      dispatch({type: A.RP});
      if (st.ops <= 1) dispatch({type: A.ET});
    }
  };

  const scores = useMemo(() => {
    const ss = Array(S).fill().map(() => Array(S).fill(0));
    for (let x = 0; x < S; x++) {
      for (let y = 0; y < S; y++) {
        if (st.board[x][y] === P.N) ss[x][y] = AI.eval(st.board, x, y, st.p);
      }
    }
    const max = Math.max(...ss.flat());
    return max > 0 ? ss.map(r => r.map(v => v / max)) : ss;
  }, [st.board, st.p]);

  const Cell = ({x, y, v, s}) => (
    <div
      className={`w-full h-full flex items-center justify-center cursor-pointer text-[11px] text-black
        ${v === P.N ? 'bg-white' : v === P.A ? 'bg-blue-500' : 'bg-red-500'}`}
      onClick={() => click(x, y)}
      style={{
        backgroundColor: v === P.N && map ? `hsla(${(1-s)*240},100%,50%,${0.1+s*0.3})` : undefined
      }}
    >
      {v !== P.N ? (v === P.A ? '1' : '2') : (map ? s.toFixed(2) : '')}
    </div>
  );

  return (
    <div className="min-h-screen min-w-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-[500px] h-[600px] bg-white shadow-lg rounded-sm">
        {/* Header */}
        <div className="h-12 px-4 flex items-center justify-between border-b border-gray-200">
          <h1 className="text-xl font-medium text-gray-800">CTOR Game</h1>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox"
                checked={ai}
                onChange={(e) => setAi(e.target.checked)}
                className="w-3.5 h-3.5"
              />
              <span className="text-sm text-gray-600">AI Player 2</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox"
                checked={map}
                onChange={(e) => setMap(e.target.checked)}
                className="w-3.5 h-3.5"
              />
              <span className="text-sm text-gray-600">Heatmap</span>
            </label>
          </div>
        </div>

        {/* Game Status */}
        <div className="h-10 px-4 flex items-center justify-between bg-gray-50 text-sm text-gray-600">
          <div className="flex gap-4">
            <span>Player: {st.p === P.A ? '1' : '2'}</span>
            <span>Ops: {st.ops}</span>
          </div>
          <div className="flex gap-4">
            <span>P1: {st.board.flat().filter(c => c === P.A).length}</span>
            <span>P2: {st.board.flat().filter(c => c === P.B).length}</span>
          </div>
        </div>

        {/* Game Grid */}
        <div className="p-4 h-[calc(100%-88px)]">
          <div className="grid grid-cols-10 gap-px bg-gray-200 h-full">
            {st.board.map((r,x) => r.map((c,y) => (
              <Cell key={`${x}-${y}`} x={x} y={y} v={c} s={scores[x][y]}/>
            )))}
          </div>
        </div>

        {/* Game Over Dialog */}
        {alt && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-80">
              <h3 className="text-lg font-semibold mb-2">Game Over</h3>
              <p className="text-gray-600 mb-4">{msg}</p>
              <button 
                onClick={() => window.location.reload()}
                className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                New Game
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CTORGame;