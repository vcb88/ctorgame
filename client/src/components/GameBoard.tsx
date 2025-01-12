import React, { useState, useEffect } from 'react';
import { GameCell } from './GameCell';
import { IPosition, Player, OperationType } from '../shared';
import { GameError } from '../types/connection';
import { GameActionType } from '../types/actions';
import { logger } from '../utils/logger';

interface GameBoardProps {
  board: (Player | null)[][];
  onCellClick?: (row: number, col: number) => void;
  disabled?: boolean;
  lastMove?: IPosition;
  error?: GameError;
  loading?: boolean;
  operationInProgress?: GameActionType;
  isValidMove?: (row: number, col: number) => boolean;
  onRetry?: () => void;
  currentPlayer?: Player;
  highlightedCells?: IPosition[];
}

export function GameBoard({
  board,
  onCellClick,
  disabled = false,
  error,
  loading = false,
  operationInProgress,
  isValidMove,
  onRetry,
  currentPlayer,
  highlightedCells = [],
  lastMove
}: GameBoardProps) {
  const [previousBoard, setPreviousBoard] = useState<(Player | null)[][]>([]);
  const [capturedCells, setCapturedCells] = useState<{ [key: string]: boolean }>({});

  // Log component state changes
  useEffect(() => {
    logger.debug('GameBoard state updated', {
      component: 'GameBoard',
      data: {
        loading,
        operationInProgress,
        error,
        currentPlayer,
        lastMove,
        highlightedCellsCount: highlightedCells.length
      }
    });
  }, [loading, operationInProgress, error, currentPlayer, lastMove, highlightedCells]);

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

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    if (!onCellClick) return;

    // Log cell click attempt
    logger.userAction('cellClick', { row: rowIndex, col: colIndex });

    // Check if the move is valid
    const moveValid = isValidMove ? isValidMove(rowIndex, colIndex) : (!disabled && board[rowIndex][colIndex] === null);

    if (!moveValid) {
      logger.debug('Invalid move attempt', {
        component: 'GameBoard',
        data: {
          row: rowIndex,
          col: colIndex,
          reason: 'Move validation failed'
        }
      });
      return;
    }

    if (loading && operationInProgress === GameActionType.MAKE_MOVE) {
      logger.debug('Move ignored - operation in progress', {
        component: 'GameBoard',
        data: {
          row: rowIndex,
          col: colIndex,
          operationInProgress
        }
      });
      return;
    }

    onCellClick(rowIndex, colIndex);
  };

  // Special styling for cells based on their state
  const getCellHighlightState = (rowIndex: number, colIndex: number) => {
    const pos = { x: colIndex, y: rowIndex };
    const isHighlighted = highlightedCells.some(cell => cell.x === pos.x && cell.y === pos.y);
    const isLastMove = lastMove && lastMove.x === pos.x && lastMove.y === pos.y;
    
    return { isHighlighted, isLastMove };
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4 bg-red-50 rounded-lg">
        <div className="text-red-600 mb-4">{error.message}</div>
        {onRetry && error.retryable && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-10 gap-1 bg-gray-200 p-2">
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const { isHighlighted, isLastMove } = getCellHighlightState(rowIndex, colIndex);
          const isValidMoveCell = isValidMove ? isValidMove(rowIndex, colIndex) : (!disabled && cell === null);
          
          return (
            <GameCell
              key={`${rowIndex}-${colIndex}`}
              row={rowIndex}
              col={colIndex}
              value={cell}
              disabled={disabled || loading}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              isValidMove={isValidMoveCell}
              isBeingCaptured={capturedCells[`${rowIndex}-${colIndex}`]}
              previousValue={previousBoard[rowIndex]?.[colIndex]}
              isHighlighted={isHighlighted}
              isLastMove={isLastMove}
              currentPlayer={currentPlayer}
            />
          );
        })
      )}
    </div>
  );
}

GameBoard.displayName = 'GameBoard';