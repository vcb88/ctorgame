import React, { useState, useEffect, ReactNode } from 'react';
import { useMultiplayerGame } from '@/hooks/useMultiplayerGame.js';
// Game types
import type { CellValue } from '@ctor-game/shared/types/core.js';
import { BOARD_SIZE } from '@ctor-game/shared/config/constants.js';
import type { 
  GameState,
  GameStatus,
  MoveType,
  GameMove,
  PlayerNumber,
  Position,
  Scores,
  GameId
} from '@ctor-game/shared/types/base/types.js';

import { cn } from '@/lib/utils.js';
import { GameCell } from '@/components/GameCell.js';
import { logger } from '@/utils/logger.js';
import { adaptScores } from '@/utils/adapters.js';

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
    // Convert to [x, y] position format
    const position: Position = [col, row];
    logger.userAction('cellClick', { position });

    if (!isMyTurn) {
      logger.debug('Cell click ignored - not player\'s turn', {
        component: 'Game',
        data: { position, currentPlayer: gameState?.currentPlayer }
      });
      return;
    }

    if (gameState?.board[row][col] !== 0) {
      logger.debug('Cell click ignored - cell not empty', {
        component: 'Game',
        data: { position, cellValue: gameState?.board[row][col] }
      });
      return;
    }

    if (gameState?.gameOver) {
      logger.debug('Cell click ignored - game is over', {
        component: 'Game',
        data: { position }
      });
      return;
    }

    if (!gameState?.currentTurn?.placeOperations || gameState.currentTurn.placeOperations <= 0) {
      logger.debug('Cell click ignored - no operations left', {
        component: 'Game',
        data: { position, operationsLeft: gameState?.currentTurn.placeOperations }
      });
      return;
    }

    logger.userAction('makeMove', { position, type: 'place' as MoveType });
    makeMove(position[0], position[1], 'place' as MoveType);  // Using x, y, type for move
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 text-xl mb-4">{error.message}</div>
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
        You are {Number(playerNumber) === 1 ? 'First' : 'Second'} Player
      </div>
      <div className="text-xl mb-8">
        {gameState.gameOver
          ? gameState.winner !== null
            ? `${gameState.winner === 1 ? 'First' : 'Second'} Player wins!`
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
              <span>First Player: {gameState.scores['player1']}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500"></div>
              <span>Second Player: {gameState.scores['player2']}</span>
            </div>
          </div>
          <div>
            Operations left: {gameState.currentTurn.placeOperations}
          </div>
        </div>

        <div className="grid grid-cols-10 gap-1 bg-gray-200 p-2">
          {Array.from({length: BOARD_SIZE}, (_, rowIndex) =>
            Array.from({length: BOARD_SIZE}, (_, colIndex) => {
              const cell = gameState.board[rowIndex][colIndex];
              const position: Position = [colIndex, rowIndex];  // [x, y] format
              const isDisabled = !isMyTurn || cell !== 0 || gameState.gameOver || gameState.currentTurn.placeOperations <= 0;
              return (
                <GameCell
                  key={`${rowIndex}-${colIndex}`}
                  position={position}
                  value={cell}
                  disabled={isDisabled}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  isValidMove={!isDisabled && cell === 0 && gameState.currentTurn.placeOperations > 0}
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
                  ({gameState.winner ? gameState.scores[`player${gameState.winner}`] : 0} pieces)
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