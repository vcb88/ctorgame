import React from 'react';
import { cn } from '@/lib/utils';
import { ITurnState, Player, OperationType } from '../shared';
import { GameError } from '../types/connection';
import { GameActionType } from '../types/actions';
import { logger } from '../utils/logger';

interface GameControlsProps {
  currentTurn: ITurnState;
  operationInProgress?: GameActionType;
  loading?: boolean;
  error?: GameError;
  onEndTurn?: () => Promise<void>;
  onUndoLastMove?: () => Promise<void>;
  canEndTurn: boolean;
  canUndoMove: boolean;
  currentPlayer?: Player;
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
  const handleEndTurn = async () => {
    if (!onEndTurn || loading || !canEndTurn) return;

    logger.userAction('endTurn');
    try {
      await onEndTurn();
    } catch (err) {
      logger.error('End turn failed', { error: err });
    }
  };

  const handleUndoMove = async () => {
    if (!onUndoLastMove || loading || !canUndoMove) return;

    logger.userAction('undoMove');
    try {
      await onUndoLastMove();
    } catch (err) {
      logger.error('Undo move failed', { error: err });
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
            currentPlayer === Player.First ? "bg-cyan-500" : "bg-red-500"
          )}></div>
          <span className="text-sm">
            {currentPlayer === Player.First ? "First" : "Second"} Player's Turn
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
                currentPlayer === Player.First ? "bg-cyan-500" : "bg-red-500",
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
              ? (currentPlayer === Player.First
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
              ? (currentPlayer === Player.First
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
                  move.type === OperationType.PLACE
                    ? "bg-green-500/20 text-green-400"
                    : "bg-blue-500/20 text-blue-400"
                )}
              >
                {move.type === OperationType.PLACE ? "Place" : "Replace"} at ({move.position.x}, {move.position.y})
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

GameControls.displayName = 'GameControls';