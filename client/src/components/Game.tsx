import React, { useState, useEffect } from 'react';
import { useMultiplayerGame } from '@/hooks/useMultiplayerGame';
// Game types
import { 
  Player,
  IBoard 
} from '@ctor-game/shared/types/game';

// Operations
import { 
  OperationType,
  GameOutcome 
} from '@ctor-game/shared/types/base/enums';
import { cn } from '@/lib/utils';
import { GameCell } from '@/components/GameCell';
import { logger } from '@/utils/logger';

export const Game: React.FC = () => {
  const {
    gameId,
    playerNumber,
    gameState,
    error,
    isMyTurn,
    createGame,
    joinGame,
    makeMove,
  } = useMultiplayerGame();

  // Log component mount
  useEffect(() => {
    logger.debug('Game component mounted', { component: 'Game' });
    return () => {
      logger.debug('Game component unmounted', { component: 'Game' });
    };
  }, []);

  // Log state changes
  useEffect(() => {
    logger.debug('Game state updated', {
      component: 'Game',
      data: {
        gameId,
        playerNumber,
        gameState,
        error,
        isMyTurn
      }
    });
  }, [gameId, playerNumber, gameState, error, isMyTurn]);

  const [joinGameId, setJoinGameId] = useState('');

  const handleCellClick = (row: number, col: number) => {
    logger.userAction('cellClick', { row, col });

    if (!isMyTurn) {
      logger.debug('Cell click ignored - not player\'s turn', {
        component: 'Game',
        data: { row, col, currentPlayer: gameState?.currentPlayer }
      });
      return;
    }

    if (gameState?.board.cells[row][col] !== null) {
      logger.debug('Cell click ignored - cell not empty', {
        component: 'Game',
        data: { row, col, cellValue: gameState?.board.cells[row][col] }
      });
      return;
    }

    if (gameState?.gameOver) {
      logger.debug('Cell click ignored - game is over', {
        component: 'Game',
        data: { row, col }
      });
      return;
    }

    if (gameState?.currentTurn.placeOperationsLeft <= 0) {
      logger.debug('Cell click ignored - no operations left', {
        component: 'Game',
        data: { row, col, operationsLeft: gameState?.currentTurn.placeOperationsLeft }
      });
      return;
    }

    logger.userAction('makeMove', { row, col, type: OperationType.PLACE });
    makeMove(row, col, OperationType.PLACE);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 text-xl mb-4">{error}</div>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => window.location.reload()}
        >
          Start New Game
        </button>
      </div>
    );
  }

  if (!gameId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-8">
        <h1 className="text-4xl font-bold mb-8">Tic Tac Toe Online</h1>
        <div className="flex flex-col items-center gap-4">
          <button
            className="bg-blue-500 text-white px-6 py-3 rounded-lg text-xl w-full"
            onClick={createGame}
          >
            Create New Game
          </button>
          <div className="text-center my-4">- OR -</div>
          <div className="flex flex-col gap-2 w-full">
            <input
              type="text"
              value={joinGameId}
              onChange={(e) => setJoinGameId(e.target.value)}
              placeholder="Enter Game ID"
              className="border p-3 rounded-lg text-lg w-full"
            />
            <button
              className="bg-green-500 text-white px-6 py-3 rounded-lg text-xl w-full"
              onClick={() => joinGame(joinGameId)}
            >
              Join Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl mb-4">Waiting for opponent...</h2>
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
        You are {playerNumber === Player.First ? 'First' : 'Second'} Player
      </div>
      <div className="text-xl mb-8">
        {gameState.gameOver
          ? gameState.winner !== null
            ? `${gameState.winner === Player.First ? 'First' : 'Second'} Player wins!`
            : "It's a draw!"
          : isMyTurn
          ? "Your turn"
          : "Opponent's turn"}
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500"></div>
              <span>First Player: {gameState.scores[Player.First]}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500"></div>
              <span>Second Player: {gameState.scores[Player.Second]}</span>
            </div>
          </div>
          <div>
            Operations left: {gameState.currentTurn.placeOperationsLeft}
          </div>
        </div>

        <div className="grid grid-cols-10 gap-1 bg-gray-200 p-2">
          {gameState.board.cells.map((row: (Player | null)[], rowIndex: number) =>
            row.map((cell: Player | null, colIndex: number) => {
              const isDisabled = !isMyTurn || cell !== null || gameState.gameOver || gameState.currentTurn.placeOperationsLeft <= 0;
              return (
                <GameCell
                  key={`${rowIndex}-${colIndex}`}
                  row={rowIndex}
                  col={colIndex}
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
                  gameState.winner === Player.First ? "bg-blue-500" : "bg-red-500"
                )}></div>
                {gameState.winner === Player.First ? 'First' : 'Second'} Player
                <div className="text-gray-600 ml-2">
                  ({gameState.scores[gameState.winner]} pieces)
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