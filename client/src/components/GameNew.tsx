import React, { useState, useEffect } from 'react';
import { useMultiplayerGame } from '@/hooks/useMultiplayerGame.js';
import type { 
  GameState,
  GameStatus,
  PlayerNumber,
  CellValue,
  Position,
  GameError
} from '@ctor-game/shared/types/base/types.js';
import { 
  OperationType 
} from '@ctor-game/shared/types/enums.js';
import { GameActionType as GameOperationType } from '@/types/actions.js';
import { cn } from '@/lib/utils.js';
import { GameCell } from '@/components/GameCell.js';
import { logger } from '@/utils/logger.js';

export const GameNew: React.FC = () => {
  const {
    gameId,
    playerNumber,
    gameState,
    error,
    loading,
    operationInProgress,
    isMyTurn,
    createGame,
    joinGame,
    makeMove,
    canRetry,
    canRecover
  } = useMultiplayerGame();

  // Log state changes
  useEffect(() => {
    logger.debug('Game state updated', {
      component: 'GameNew',
      data: {
        gameId,
        playerNumber,
        gameState,
        error,
        isMyTurn,
        loading,
        operationInProgress
      }
    });
  }, [gameId, playerNumber, gameState, error, isMyTurn, loading, operationInProgress]);

  const [joinGameId, setJoinGameId] = useState('');
  const [lastError, setLastError] = useState<string | null>(null);

  const handleCreateGame = async () => {
    try {
      setLastError(null);
      await createGame();
    } catch (err) {
      setLastError('Failed to create game. Please try again.');
      logger.error('Create game failed', { data: err });
    }
  };

  const handleJoinGame = async () => {
    try {
      setLastError(null);
      await joinGame(joinGameId);
    } catch (err) {
      setLastError('Failed to join game. Please check the game ID and try again.');
      logger.error('Join game failed', { data: err });
    }
  };

  const handleCellClick = async (row: number, col: number) => {
    logger.userAction('cellClick', { row, col });

    if (!isMyTurn) {
      logger.debug('Cell click ignored - not player\'s turn', {
        component: 'GameNew',
        data: { row, col, currentPlayer: gameState?.currentPlayer }
      });
      return;
    }

    if (gameState?.board[row][col] !== null) {
      logger.debug('Cell click ignored - cell not empty', {
        component: 'GameNew',
        data: { row, col, cellValue: gameState?.board[row][col] }
      });
      return;
    }

    if (gameState?.gameOver) {
      logger.debug('Cell click ignored - game is over', {
        component: 'GameNew',
        data: { row, col }
      });
      return;
    }

    if (gameState?.currentTurn.placeOperationsLeft <= 0) {
      logger.debug('Cell click ignored - no operations left', {
        component: 'GameNew',
        data: { row, col, operationsLeft: gameState?.currentTurn.placeOperationsLeft }
      });
      return;
    }

    try {
      logger.userAction('makeMove', { row, col, type: OperationType.PLACE });
      await makeMove(row, col, OperationType.PLACE);
    } catch (err) {
      logger.error('Make move failed', { data: err });
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 text-xl mb-4">
          {error.message}
        </div>
        <div className="flex gap-4">
          {canRetry && (
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={() => window.location.reload()}
              disabled={loading}
            >
              Retry
            </button>
          )}
          {canRecover && (
            <button
              className="bg-green-500 text-white px-4 py-2 rounded"
              onClick={() => window.location.reload()}
              disabled={loading}
            >
              Recover Game
            </button>
          )}
          <button
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={() => window.location.reload()}
          >
            Start New Game
          </button>
        </div>
      </div>
    );
  }

  if (!gameId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-8">
        <h1 className="text-4xl font-bold mb-8">Tic Tac Toe Online</h1>
        <div className="flex flex-col items-center gap-4">
          {lastError && (
            <div className="text-red-500 mb-4">{lastError}</div>
          )}
          <button
            className={cn(
              "bg-blue-500 text-white px-6 py-3 rounded-lg text-xl w-full",
              loading && operationInProgress === GameOperationType.CREATE_GAME && "opacity-50 cursor-not-allowed"
            )}
            onClick={handleCreateGame}
            disabled={loading}
          >
            {loading && operationInProgress === GameOperationType.CREATE_GAME ? 'Creating...' : 'Create New Game'}
          </button>
          <div className="text-center my-4">- OR -</div>
          <div className="flex flex-col gap-2 w-full">
            <input
              type="text"
              value={joinGameId}
              onChange={(e) => setJoinGameId(e.target.value)}
              placeholder="Enter Game ID"
              className="border p-3 rounded-lg text-lg w-full"
              disabled={loading}
            />
            <button
              className={cn(
                "bg-green-500 text-white px-6 py-3 rounded-lg text-xl w-full",
                loading && operationInProgress === GameOperationType.JOIN_GAME && "opacity-50 cursor-not-allowed"
              )}
              onClick={handleJoinGame}
              disabled={loading}
            >
              {loading && operationInProgress === GameOperationType.JOIN_GAME ? 'Joining...' : 'Join Game'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl mb-4">
          {loading ? 'Connecting to game...' : 'Waiting for opponent...'}
        </h2>
        <p className="text-xl">Share this game ID with your friend:</p>
        <div className="bg-gray-100 p-4 rounded-lg mt-2 text-xl font-mono">
          {gameId}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-xl mb-4">
        Game ID: <span className="font-mono">{gameId}</span>
      </div>
      <div className="text-xl mb-4">
        You are {playerNumber === 1 ? 'First' : 'Second'} Player
      </div>
      <div className="text-xl mb-8">
        {gameState.gameOver
          ? gameState.winner !== null
            ? `${gameState.winner === 1 ? 'First' : 'Second'} Player wins!`
            : "It's a draw!"
          : isMyTurn
          ? loading && operationInProgress === GameOperationType.MAKE_MOVE
            ? "Making move..."
            : "Your turn"
          : "Opponent's turn"}
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500"></div>
              <span>First Player: {gameState.scores.player1}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500"></div>
              <span>Second Player: {gameState.scores.player2}</span>
            </div>
          </div>
          <div>
            Operations left: {gameState.currentTurn.placeOperationsLeft}
          </div>
        </div>

        <div className={cn(
          "grid grid-cols-10 gap-1 bg-gray-200 p-2",
          loading && "opacity-50 pointer-events-none"
        )}>
          {gameState.board.map((row: CellValue[], rowIndex: number) =>
            row.map((cell: CellValue, colIndex: number) => {
              const position: Position = [colIndex, rowIndex];
              const isDisabled = 
                !isMyTurn || 
                cell !== null || 
                gameState.gameOver || 
                gameState.currentTurn.placeOperationsLeft <= 0 ||
                loading;
              return (
                <GameCell
                  key={`${rowIndex}-${colIndex}`}
                  position={position}
                  value={cell}
                  disabled={isDisabled}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  isValidMove={!isDisabled && cell === null && gameState.currentTurn.placeOperationsLeft > 0}
                />
              );
            })
          )}
        </div>

        <div className="mt-4 flex items-center justify-center">
          <div className="px-4 py-2 bg-gray-100 rounded-lg text-center">
            {gameState.isFirstTurn ? "First turn: 1 placement only" : "Regular turn: 2 placements"}
          </div>
        </div>
      </div>
      {gameState.gameOver && (
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="text-2xl font-bold">
            Game Over!
            {gameState.winner === null ? (
              <div className="text-gray-600">It's a draw!</div>
            ) : (
              <div className="flex items-center gap-2">
                Winner: 
                <div className={cn(
                  "w-6 h-6 rounded-full",
                  gameState.winner === 1 ? "bg-blue-500" : "bg-red-500"
                )}></div>
                {gameState.winner === 1 ? 'First' : 'Second'} Player
                <div className="text-gray-600 ml-2">
                  ({gameState.scores[`player${gameState.winner}`]} pieces)
                </div>
              </div>
            )}
          </div>
          <button
            className="bg-blue-500 text-white px-6 py-3 rounded-lg text-xl hover:bg-blue-600 transition-colors"
            onClick={() => window.location.reload()}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};