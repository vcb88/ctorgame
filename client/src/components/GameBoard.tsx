import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameCell } from './GameCell';
import { Position } from '@ctor-game/shared/types/game/geometry';
import { Player } from '@ctor-game/shared/types/game';
import { OperationType } from '@ctor-game/shared/types/enums';
import { GameError } from '../types/connection';
import { GameActionType } from '../types/actions';
import { logger } from '../utils/logger';
import { AnimationType, CellAnimationState } from '../types/animations';

interface GameBoardProps {
  board: (Player | null)[][];
  onCellClick?: (row: number, col: number) => void;
  disabled?: boolean;
  lastMove?: Position;
  error?: GameError;
  loading?: boolean;
  operationInProgress?: GameActionType;
  isValidMove?: (row: number, col: number) => boolean;
  onRetry?: () => void;
  currentPlayer?: Player;
  highlightedCells?: Position[];
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
  const [animationStates, setAnimationStates] = useState<Record<string, CellAnimationState>>({});
  const previousBoardRef = useRef<(Player | null)[][]>([]);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear completed animations
  const clearAnimations = useCallback((positions?: Position[]) => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    setAnimationStates(prevStates => {
      if (!positions) {
        return {};
      }

      const newStates = { ...prevStates };
      positions.forEach(pos => {
        delete newStates[`${pos.y}-${pos.x}`];
      });
      return newStates;
    });
  }, []);

  // Handle animation timeouts
  const scheduleAnimationCleanup = useCallback((positions: Position[], duration: number) => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    animationTimeoutRef.current = setTimeout(() => {
      clearAnimations(positions);
      animationTimeoutRef.current = null;
    }, duration);
  }, [clearAnimations]);

  // Log component state changes
  useEffect(() => {
    logger.componentState('GameBoard', {
      loading,
      operationInProgress,
      error,
      currentPlayer,
      lastMove,
      highlightedCellsCount: highlightedCells.length
    });
  }, [loading, operationInProgress, error, currentPlayer, lastMove, highlightedCells]);

  // Log animation states for captured cells
  useEffect(() => {
    const capturedCellKeys = Object.keys(animationStates).filter(
      key => animationStates[key]?.type === AnimationType.CAPTURE
    );
    if (capturedCellKeys.length > 0) {
      logger.animation('capture', {
        cells: capturedCellKeys,
        previousBoard: previousBoardRef.current,
        currentBoard: board
      }, 'GameBoard');
    }
  }, [animationStates, board]);

  // Track board changes and manage animations
  useEffect(() => {
    const capturedPositions: Position[] = [];
    const placedPositions: Position[] = [];
    
    board.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const prevValue = previousBoardRef.current[rowIndex]?.[colIndex];
        
        // Skip if previous state isn't initialized
        if (prevValue === undefined) return;
        
        // Detect changes
        if (cell !== prevValue) {
          const pos = { x: colIndex, y: rowIndex };
          
          if (prevValue !== null && cell !== null) {
            // Capture animation
            capturedPositions.push(pos);
          } else if (prevValue === null && cell !== null) {
            // Place animation
            placedPositions.push(pos);
          }
        }
      });
    });

    // Clear existing animations if we have new changes
    if (capturedPositions.length > 0 || placedPositions.length > 0) {
      clearAnimations();
      
      // Set new animation states
      setAnimationStates(prevStates => {
        const newStates: Record<string, CellAnimationState> = { ...prevStates };
        
        const now = Date.now();
        
        capturedPositions.forEach(pos => {
          newStates[`${pos.y}-${pos.x}`] = {
            isAnimating: true,
            type: AnimationType.CAPTURE,
            startTime: now,
            data: {
              previousValue: previousBoardRef.current[pos.y]?.[pos.x],
              newValue: board[pos.y][pos.x]
            }
          };
        });
        
        placedPositions.forEach(pos => {
          newStates[`${pos.y}-${pos.x}`] = {
            isAnimating: true,
            type: AnimationType.PLACE,
            startTime: now,
            data: {
              newValue: board[pos.y][pos.x]
            }
          };
        });
        
        return newStates;
      });

      // Schedule cleanup
      const positions = [...capturedPositions, ...placedPositions];
      if (positions.length > 0) {
        scheduleAnimationCleanup(positions, 500); // 500ms animation duration
      }

      // Log animation events
      logger.animation('board_change', {
        captures: capturedPositions,
        placements: placedPositions,
        previousBoard: previousBoardRef.current,
        currentBoard: board
      }, 'GameBoard');
    }

    // Update previous board reference
    previousBoardRef.current = board;
  }, [board, clearAnimations, scheduleAnimationCleanup]);

  const handleCellClick = useCallback((rowIndex: number, colIndex: number) => {
    if (!onCellClick) return;

    const position: Position = { x: colIndex, y: rowIndex };
    const cellKey = `${rowIndex}-${colIndex}`;
    const isAnimating = animationStates[cellKey]?.isAnimating;

    // Log cell click attempt
    logger.userAction('cellClick', { 
      row: rowIndex, 
      col: colIndex,
      isAnimating,
      currentAnimation: animationStates[cellKey]?.type
    });

    // Don't allow clicks during animations
    if (isAnimating) {
      logger.validation('GameBoard',
        { valid: false, reason: 'Cell is animating' },
        { position, animationType: animationStates[cellKey]?.type }
      );
      return;
    }

    // Check if the move is valid
    const moveValid = isValidMove ? isValidMove(rowIndex, colIndex) : (!disabled && board[rowIndex][colIndex] === null);
    const validationReason = !moveValid ? 
      (disabled ? 'Board is disabled' : 
       board[rowIndex][colIndex] !== null ? 'Cell is not empty' : 
       'Move validation failed') : undefined;

    logger.validation('GameBoard', 
      { valid: moveValid, reason: validationReason },
      { position, currentPlayer }
    );

    if (!moveValid) {
      return;
    }

    if (loading && operationInProgress === GameActionType.MAKE_MOVE) {
      logger.operation('MAKE_MOVE', 'error', {
        reason: 'Operation already in progress',
        position,
        operationInProgress
      });
      return;
    }

    // Clear any existing animations before making a move
    clearAnimations();
    onCellClick(rowIndex, colIndex);
  }, [onCellClick, isValidMove, disabled, board, loading, operationInProgress, currentPlayer, animationStates, clearAnimations]);

  // Special styling for cells based on their state
  const getCellHighlightState = (rowIndex: number, colIndex: number) => {
    const pos: Position = { x: colIndex, y: rowIndex };
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
              disabled={disabled || loading || animationStates[`${rowIndex}-${colIndex}`]?.isAnimating}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              isValidMove={isValidMoveCell}
              animationState={animationStates[`${rowIndex}-${colIndex}`]}
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