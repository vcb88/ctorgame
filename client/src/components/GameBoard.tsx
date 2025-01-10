import React, { useState, useEffect } from 'react';
import { GameCell } from './GameCell';

import { IPosition, Player } from '@ctor-game/shared';

interface GameBoardProps {
  board: (Player | null)[][];
  onCellClick?: (row: number, col: number) => void;
  disabled?: boolean;
  lastMove?: IPosition;
}

export function GameBoard({ board, onCellClick, disabled = false }: GameBoardProps) {
  const [previousBoard, setPreviousBoard] = useState<(Player | null)[][]>([]);
  const [capturedCells, setCapturedCells] = useState<{ [key: string]: boolean }>({});

  // Track cell captures by comparing previous and current board states
  useEffect(() => {
    const captures: { [key: string]: boolean } = {};
    board.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const prevValue = previousBoard[rowIndex]?.[colIndex];
        if (prevValue !== undefined && prevValue !== null && cell !== prevValue) {
          captures[`${rowIndex}-${colIndex}`] = true;
        }
      });
    });
    
    setCapturedCells(captures);
    setPreviousBoard(board);
  }, [board]);

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
            isValidMove={!disabled && cell === null}
            isBeingCaptured={capturedCells[`${rowIndex}-${colIndex}`]}
            previousValue={previousBoard[rowIndex]?.[colIndex]}
          />
        ))
      )}
    </div>
  );
}

GameBoard.displayName = 'GameBoard';