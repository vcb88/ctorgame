import React, { useState } from 'react';
import { useMultiplayerGame } from '../hooks/useMultiplayerGame';
import { IMove } from '../../../shared/types';

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

  const [joinGameId, setJoinGameId] = useState('');

  const handleCellClick = (row: number, col: number) => {
    if (!isMyTurn || gameState?.board[row][col] !== null || gameState?.gameOver) {
      return;
    }

    const move: IMove = { row, col };
    makeMove(move);
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
        You are Player {playerNumber === 0 ? 'X' : 'O'}
      </div>
      <div className="text-xl mb-8">
        {gameState.gameOver
          ? gameState.winner !== null
            ? `Player ${gameState.winner === 0 ? 'X' : 'O'} wins!`
            : "It's a draw!"
          : isMyTurn
          ? "Your turn"
          : "Opponent's turn"}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {gameState.board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              className={`
                w-24 h-24 flex items-center justify-center text-4xl font-bold
                bg-gray-200 hover:bg-gray-300 cursor-pointer
                ${!isMyTurn || cell !== null || gameState.gameOver ? 'cursor-not-allowed' : ''}
              `}
            >
              {cell === 0 ? 'X' : cell === 1 ? 'O' : ''}
            </div>
          ))
        )}
      </div>
      {gameState.gameOver && (
        <button
          className="mt-8 bg-blue-500 text-white px-6 py-3 rounded-lg text-xl"
          onClick={() => window.location.reload()}
        >
          Play Again
        </button>
      )}
    </div>
  );
};