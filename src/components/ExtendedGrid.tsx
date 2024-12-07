import React from 'react';
import { Board, P } from '@/types';
import { nX, nY } from '@/utils/board';
import { GRID_WIDTH, GRID_HEIGHT } from '@/constants';

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
  // Создаем индексы для строк и столбцов
  const rowIndices = [-1, ...Array.from({length: GRID_HEIGHT}, (_, i) => i), GRID_HEIGHT];
  const colIndices = [-1, ...Array.from({length: GRID_WIDTH}, (_, i) => i), GRID_WIDTH];
  
  const Cell = ({row, col, isVirtual = false}: {row: number, col: number, isVirtual?: boolean}) => {
    // row - это Y координата (вертикаль)
    // col - это X координата (горизонталь)
    const realX = nX(col);
    const realY = nY(row);
    
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
    <div 
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${GRID_WIDTH + 2}, 1fr)`,
        gap: 0
      }}
    >
      {/* Перебираем строки (Y), потом столбцы (X) */}
      {rowIndices.map(row => 
        colIndices.map(col => (
          <Cell 
            key={`${row}-${col}`}
            row={row}
            col={col}
            isVirtual={row === -1 || row === GRID_HEIGHT || col === -1 || col === GRID_WIDTH}
          />
        ))
      )}
    </div>
  );
};

export default ExtendedGrid;