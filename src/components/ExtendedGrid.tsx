import React from 'react';
import { Board, P } from '@/types';
import { n } from '@/utils/board';

interface ExtendedGridProps {
  board: Board;
  onCellClick: (x: number, y: number) => void;
  scores: number[][];
  showMap: boolean;
  selectedCell: { x: number; y: number } | null;
}

const ExtendedGrid: React.FC<ExtendedGridProps> = ({
  board,
  onCellClick,
  scores,
  showMap,
  selectedCell
}) => {
  // Создаем расширенные индексы с учетом дополнительных рядов
  const extendedIndices = [-1, ...Array.from({length: 10}, (_, i) => i), 10];
  
  const Cell = ({x, y, isVirtual = false}: {x: number, y: number, isVirtual?: boolean}) => {
    // Получаем реальные координаты с учетом заворачивания поля
    const realX = n(x);
    const realY = n(y);
    
    const v = board[realX][realY];
    const s = scores[realX][realY];
    
    const playerClass = v === P.N 
      ? '' 
      : v === P.A 
        ? 'player1'
        : 'player2';

    const content = v !== P.N 
      ? (v === P.A ? '1' : '2')
      : (showMap ? s.toFixed(2) : '');

    // Определяем базовый цвет для занятых клеток
    let baseColor = 'white';
    if (v === P.A) baseColor = '#4a90e2';
    if (v === P.B) baseColor = '#e25c5c';

    const styles = {
      width: '100%',
      height: '100%',
      ...(v === P.N && showMap ? {
        backgroundColor: `hsla(${(1-s)*240},100%,50%,${0.1+s*0.3})`
      } : {
        backgroundColor: baseColor,
      }),
      ...(isVirtual ? {
        opacity: 0.6,
        border: '1px dashed #999',
      } : {})
    };      

    return (
      <div
        className={`cell ${playerClass} 
          ${selectedCell?.x === realX && selectedCell?.y === realY ? 'ring-2 ring-yellow-400' : ''}
          ${isVirtual ? 'virtual' : 'hover:opacity-90'}`
        }
        onClick={() => !isVirtual && onCellClick(realX, realY)}
        style={styles}
      >
        {content}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-12 gap-0">
      {extendedIndices.map(i => (
        extendedIndices.map(j => (
          <Cell 
            key={`${i}-${j}`}
            x={i} 
            y={j}
            isVirtual={i === -1 || i === 10 || j === -1 || j === 10}
          />
        ))
      ))}
    </div>
  );
};

export default ExtendedGrid;