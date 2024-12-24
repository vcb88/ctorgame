import React from 'react';
import { GameCell } from './GameCell';

interface GameBoardProps {
  board: (number | null)[][];
  onCellClick?: (row: number, col: number) => void;
  disabled?: boolean;
}

export function GameBoard({ board, onCellClick, disabled = false }: GameBoardProps) {
  return (
    <div className="grid grid-cols-10 gap-1 bg-gray-200 p-2">
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <GameCell
            key={`${rowIndex}-${colIndex}`}
            row={rowIndex}
            col={colIndex}
            value={cell}
            disabled={disabled}
            onClick={onCellClick ? () => onCellClick(rowIndex, colIndex) : undefined}
          />
        ))
      )}
    </div>
  );
}

GameBoard.displayName = 'GameBoard';