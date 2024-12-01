 import { Switch, Label } from '@/components/ui';
// import { AlertDialog, Switch, Label } from '@/components/ui';
import { useReducer, useState, useEffect } from 'react';
// import { AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

// import { Cell } from '@/components/cell';
// import { PositionStats } from '@/components/PositionStats';
import { P, O, A, Position } from '@/types';
import { reducer, initialState } from '@/store/reducer';
import { AI } from '@/ai';
// import { checkEnd } from '@/utils/board';
// import { analyzePosition } from '@/utils/analysis';
import { replace } from '@/utils/board';
// import React from 'react';

export const Game = () => {
 const [st, dispatch] = useReducer(reducer, initialState);
 const [_op, _setOp] = useState(O.PL);
 const [_sel, _setSel] = useState<Position | null>(null);
 const [_alt, _setAlt] = useState(false);
 const [_msg, _setMsg] = useState('');
 const [_map, _setMap] = useState(true);
 const [ai, _setAi] = useState(true);

 useEffect(() => {
   const aiTurn = async () => {
     if (!ai || st.p !== P.B || st.ops !== 2) return;
     
     let updBoard = st.board.map(r => [...r]);
     
     const m1 = AI.findMove(updBoard, P.B, O.PL);
     if (!m1) {
       dispatch({type: A.ET});
       return;
     }
     
     dispatch({type: A.PL, x: m1.x, y: m1.y, p: P.B});
     dispatch({type: A.RP});
     
     updBoard[m1.x][m1.y] = P.B;
     updBoard = replace(updBoard);
     
     await new Promise(r => setTimeout(r, 500));
     
     const m2 = AI.findMove(updBoard, P.B, O.PL);
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

 // const stats = useMemo(() => ({
 //   p1: analyzePosition(st.board, P.A),
 //   p2: analyzePosition(st.board, P.B)
 // }), [st.board]);

 // const click = (x: number, y: number) => {
 //  const end = checkEnd(st.board);
 //  if (end.over) {
 //    setMsg(`Game Over! Winner: ${end.winner}`);
 //    setAlt(true);
 //    return;
 //  }
//
//   if (ai && st.p === P.B) return;
//   if (st.ops <= 0) { 
//     dispatch({type: A.ET}); 
//     return; 
//   }
//   
//   if (op === O.PL && st.board[x][y] === P.N) {
//     dispatch({type: A.PL, x, y, p: st.p});
//     dispatch({type: A.RP});
//     if (st.ops <= 1) dispatch({type: A.ET});
//   }
// };

 // const scores = useMemo(() => {
 //   const ss = Array(S).fill(null).map(() => Array(S).fill(0));
 //   for (let x = 0; x < S; x++) {
 //     for (let y = 0; y < S; y++) {
 //       if (st.board[x][y] === P.N) {
 //         ss[x][y] = AI.eval(st.board, st.board, x, y, st.p);
 //       }
 //     }
 //   }
 //   const max = Math.max(...ss.flat());
 //   return max > 0 ? ss.map(r => r.map(v => v / max)) : ss;
 // }, [st.board, st.p]);

  const [aiPlayer, setAiPlayer] = useState(false);
  const [heatmap, setHeatmap] = useState(false);
 
  const gridData = Array(10).fill(null).map(() => Array(10).fill(null).map(() => ({
    value: 0.32,
    type: 'default'
  })));

 // Add some sample colored cells
 gridData[0][0] = { value: 2, type: 'p2' };
 gridData[0][3] = { value: 2, type: 'p2' };
 gridData[0][6] = { value: 2, type: 'p2' };
 gridData[2][1] = { value: 2, type: 'p2' };
 gridData[2][5] = { value: 1, type: 'p1' };
 gridData[3][4] = { value: 1, type: 'p1' };
 gridData[5][2] = { value: 1, type: 'p1' };
 gridData[5][5] = { value: 1, type: 'p1' };

 return (
   <div className="min-h-screen flex items-center justify-center p-4">
     <div className="w-full max-w-[600px] aspect-[4/5]">
       <div className="h-full flex flex-col">
         {/* Header with switches */}
         <div className="flex justify-between items-center mb-4">
           <div className="text-lg font-semibold">
             Grid Game
           </div>
           <div className="flex items-center gap-4 text-sm">
             <div className="flex items-center gap-2">
               <Switch
                 checked={aiPlayer}
                 onCheckedChange={setAiPlayer}
                 id="ai-player"
               />
               <Label htmlFor="ai-player" className="whitespace-nowrap">AI Player 2</Label>
             </div>
             <div className="flex items-center gap-2">
               <Switch
                 checked={heatmap}
                 onCheckedChange={setHeatmap}
                 id="heatmap"
               />
               <Label htmlFor="heatmap">Heatmap</Label>
             </div>
           </div>
         </div>

         {/* Game status */}
         <div className="flex justify-between items-center mb-4 text-sm">
           <div className="flex items-center gap-4">
             <span>Player: 1</span>
             <span>Ops: 2</span>
           </div>
           <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 bg-blue-500"></div>
               <span>P1: 4</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 bg-red-500"></div>
               <span>P2: 4</span>
             </div>
           </div>
         </div>

         {/* Grid container with fixed aspect ratio */}
         <div className="flex-grow relative">
           <div className="absolute inset-0">
             <div className="h-full grid grid-cols-10 gap-1 bg-gray-200 p-1 rounded">
               {gridData.map((row, rowIndex) => (
                 row.map((cell, colIndex) => (
                   <div
                     key={`${rowIndex}-${colIndex}`}
                     className={`
                       aspect-square flex items-center justify-center text-sm font-medium
                       ${cell.type === 'default' ? 'bg-emerald-100' : ''}
                       ${cell.type === 'p1' ? 'bg-blue-500 text-white' : ''}
                       ${cell.type === 'p2' ? 'bg-red-500 text-white' : ''}
                     `}
                   >
                     {cell.value}
                   </div>
                 ))
               ))}
             </div>
           </div>
         </div>
       </div>
     </div>
   </div>
 );
};

