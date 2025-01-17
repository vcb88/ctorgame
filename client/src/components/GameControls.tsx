import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { 
    PlayerNumber, 
    TurnState, 
    MoveType, 
    GameError,
    Position 
} from '@ctor-game/shared/types/core.js';
import { GameActionType } from '@/types/actions';
import { logger } from '@/utils/logger';

type GameControlsProps = {
  currentTurn: TurnState;
  operationInProgress?: GameActionType;
  loading?: boolean;
  error?: GameError;
  onEndTurn?: () => Promise<void>;
  onUndoLastMove?: () => Promise<void>;
  canEndTurn: boolean;
  canUndoMove: boolean;
  currentPlayer?: PlayerNumber;
  isFirstTurn?: boolean;
}

export const GameControls: React.FC<GameControlsProps> = ({
  currentTurn,
  operationInProgress,
  loading = false,
  error,
  onEndTurn,
  onUndoLastMove,
  canEndTurn,
  canUndoMove,
  currentPlayer,
  isFirstTurn = false
}) => {
  // Log component state changes
  useEffect(() => {
    logger.componentState('GameControls', {
      loading,
      operationInProgress,
      error,
      currentPlayer,
      canEndTurn,
      canUndoMove,
      moveCount: currentTurn.moves.length,
      operationsLeft: currentTurn.placeOperationsLeft
    });
  }, [loading, operationInProgress, error, currentPlayer, canEndTurn, canUndoMove, currentTurn]);

  const handleEndTurn = async () => {
    if (!onEndTurn || loading || !canEndTurn) {
      if (!canEndTurn) {
        logger.validation('GameControls', 
          { valid: false, reason: 'Cannot end turn' },
          { currentPlayer, moves: currentTurn.moves, operationsLeft: currentTurn.placeOperationsLeft }
        );
      }
      return;
    }

    logger.operation('END_TURN', 'start', {
      currentPlayer,
      moves: currentTurn.moves,
      operationsLeft: currentTurn.placeOperationsLeft
    });

    try {
      await onEndTurn();
      logger.operation('END_TURN', 'complete');
    } catch (err) {
      logger.operation('END_TURN', 'error', { error: err });
    }
  };

  const handleUndoMove = async () => {
    if (!onUndoLastMove || loading || !canUndoMove) {
      if (!canUndoMove) {
        logger.validation('GameControls', 
          { valid: false, reason: 'Cannot undo move' },
          { currentPlayer, moves: currentTurn.moves }
        );
      }
      return;
    }

    logger.operation('UNDO_MOVE', 'start', {
      currentPlayer,
      moves: currentTurn.moves,
      lastMove: currentTurn.moves[currentTurn.moves.length - 1]
    });

    try {
      await onUndoLastMove();
      logger.operation('UNDO_MOVE', 'complete');
    } catch (err) {
      logger.operation('UNDO_MOVE', 'error', { error: err });
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center space-y-2 p-4 bg-red-50 rounded-lg">
        <div className="text-red-600">{error.message}</div>
        {error.retryable && (
          <button
            onClick={handleEndTurn}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 p-4 bg-black/50 rounded-lg">
      {/* Turn Status */}
      <div className="flex justify-between items-center">
        <div className="text-sm">
          {isFirstTurn ? "First turn: 1 placement only" : "Regular turn: 2 placements"}
        </div>
        <div className="flex items-center space-x-2">
          <div className={cn(
            "w-3 h-3 rounded-full",
            currentPlayer === 1 ? "bg-cyan-500" : "bg-red-500"
          )}></div>
          <span className="text-sm">
            {currentPlayer === 1 ? "First" : "Second"} Player's Turn
          </span>
        </div>
      </div>

      {/* Operations Left Counter */}
      <div className="flex justify-center items-center space-x-2">
        <div className="text-sm">Operations left:</div>
        <div className="flex space-x-1">
          {Array.from({ length: currentTurn.placeOperationsLeft }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-6 rounded",
                currentPlayer === 1 ? "bg-cyan-500" : "bg-red-500",
                "animate-pulse"
              )}
            ></div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={handleUndoMove}
          disabled={loading || !canUndoMove}
          className={cn(
            "px-4 py-2 rounded text-sm font-medium transition-all duration-200",
            "border-2",
            canUndoMove && !loading
              ? (currentPlayer === 1
                ? "border-cyan-500 text-cyan-400 hover:bg-cyan-500/20"
                : "border-red-500 text-red-400 hover:bg-red-500/20")
              : "border-gray-500 text-gray-400 cursor-not-allowed",
            loading && operationInProgress === GameActionType.UNDO_MOVE && "animate-pulse"
          )}
        >
          {loading && operationInProgress === GameActionType.UNDO_MOVE
            ? "Undoing..."
            : "Undo Move"}
        </button>

        <button
          onClick={handleEndTurn}
          disabled={loading || !canEndTurn}
          className={cn(
            "px-4 py-2 rounded text-sm font-medium transition-all duration-200",
            canEndTurn && !loading
              ? (currentPlayer === 1
                ? "bg-cyan-500 hover:bg-cyan-600"
                : "bg-red-500 hover:bg-red-600")
              : "bg-gray-500 cursor-not-allowed",
            loading && operationInProgress === GameActionType.END_TURN && "animate-pulse"
          )}
        >
          {loading && operationInProgress === GameActionType.END_TURN
            ? "Ending turn..."
            : "End Turn"}
        </button>
      </div>

      {/* Move History */}
      {currentTurn.moves.length > 0 && (
        <div className="text-xs text-gray-400">
          Moves this turn:
          <div className="flex flex-wrap gap-1 mt-1">
            {currentTurn.moves.map((move, index) => (
              <div
                key={index}
                className={cn(
                  "px-2 py-1 rounded text-xs",
                  move.type === 'place'
                    ? "bg-green-500/20 text-green-400"
                    : "bg-blue-500/20 text-blue-400"
                )}
              >
                {move.type === 'place' ? "Place" : "Replace"} at ({move.position[0]}, {move.position[1]})  {/* Position already in [x, y] format */}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

GameControls.displayName = 'GameControls';