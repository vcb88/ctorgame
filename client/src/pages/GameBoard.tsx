import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMultiplayerGame } from '@/hooks/useMultiplayerGame';
import { OperationType } from '@/shared';
import { GameCell } from '@/components/GameCell';
import { DisconnectionOverlay } from '@/components/modals/DisconnectionOverlay';
import { logger } from '@/utils/logger';
import { cn } from '@/lib/utils';

export const GameBoard: React.FC = () => {
  const navigate = useNavigate();
  const { gameId: urlGameId } = useParams<{ gameId: string }>();
  const {
    gameId,
    playerNumber,
    gameState,
    error,
    isMyTurn,
    makeMove,
  } = useMultiplayerGame();

  useEffect(() => {
    logger.debug('GameBoard mounted', { 
      component: 'GameBoard',
      gameId: urlGameId 
    });

    return () => {
      logger.debug('GameBoard unmounted', { 
        component: 'GameBoard' 
      });
    };
  }, []);

  useEffect(() => {
    if (error) {
      logger.error('GameBoard error', { error });
    }
  }, [error]);

  const handleCellClick = (row: number, col: number) => {
    if (!isMyTurn) {
      logger.debug('Cell click ignored - not player\'s turn', {
        component: 'GameBoard',
        data: { row, col, currentPlayer: gameState?.currentPlayer }
      });
      return;
    }

    if (gameState?.board.cells[row][col] !== null) {
      logger.debug('Cell click ignored - cell not empty', {
        component: 'GameBoard',
        data: { row, col, cellValue: gameState?.board.cells[row][col] }
      });
      return;
    }

    if (gameState?.gameOver) {
      logger.debug('Cell click ignored - game is over', {
        component: 'GameBoard',
        data: { row, col }
      });
      return;
    }

    if (gameState?.currentTurn.placeOperationsLeft <= 0) {
      logger.debug('Cell click ignored - no operations left', {
        component: 'GameBoard',
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
          onClick={() => navigate('/')}
        >
          Return to Menu
        </button>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-black text-cyan-400">
      <div className="max-w-4xl w-full">
        <div className="flex justify-between items-center mb-6">
          <div className="text-xl font-mono">
            Game ID: <span className="text-cyan-300">{gameId}</span>
          </div>
          <div className="text-xl font-mono">
            You: Player {playerNumber === 0 ? 'X' : 'O'}
          </div>
        </div>

        <div className="text-xl mb-6 text-center font-bold">
          {gameState.gameOver
            ? gameState.winner !== null
              ? `Player ${gameState.winner === 0 ? 'X' : 'O'} wins!`
              : "It's a draw!"
            : isMyTurn
            ? "Your turn"
            : "Opponent's turn"}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center mb-4 font-mono">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-cyan-500 rounded-sm shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
                <span>Player 1: {gameState.scores.player1}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-sm shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
                <span>Player 2: {gameState.scores.player2}</span>
              </div>
            </div>
            <div className="text-cyan-300">
              Operations left: {gameState.currentTurn.placeOperationsLeft}
            </div>
          </div>

          <div className="grid grid-cols-10 gap-1 bg-black/90 p-2 rounded border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
            {gameState.board.cells.map((row: (number | null)[], rowIndex: number) =>
              row.map((cell: number | null, colIndex: number) => (
                <GameCell
                  key={`${rowIndex}-${colIndex}`}
                  row={rowIndex}
                  col={colIndex}
                  value={cell}
                  disabled={!isMyTurn || cell !== null || gameState.gameOver || gameState.currentTurn.placeOperationsLeft <= 0}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                />
              ))
            )}
          </div>

          <div className="mt-4 flex items-center justify-center font-mono">
            <div className="px-4 py-2 bg-black/80 border border-cyan-500/30 rounded text-center shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              {gameState.isFirstTurn ? "First turn: 1 placement only" : "Regular turn: 2 placements"}
            </div>
          </div>
        </div>

        {gameState.gameOver && (
          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="text-2xl font-bold font-mono">
              Game Over!
              {gameState.winner === null ? (
                <div className="text-cyan-300">It's a draw!</div>
              ) : (
                <div className="flex items-center gap-2">
                  Winner: 
                  <div className={cn(
                    "w-6 h-6 rounded-sm",
                    "shadow-[0_0_15px_rgba(6,182,212,0.8)]",
                    gameState.winner === 0 ? "bg-cyan-500" : "bg-red-500"
                  )}></div>
                  Player {gameState.winner + 1}
                  <div className="text-cyan-300 ml-2">
                    ({gameState.winner === 0 ? gameState.scores.player1 : gameState.scores.player2} pieces)
                  </div>
                </div>
              )}
            </div>
            <button
              className={cn(
                "px-6 py-3 rounded text-xl transition-colors font-mono",
                "bg-black/80 border border-cyan-500/30",
                "text-cyan-400 hover:text-cyan-300",
                "shadow-[0_0_15px_rgba(6,182,212,0.2)]",
                "hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
              )}
              onClick={() => navigate('/')}
            >
              Return to Menu
            </button>
          </div>
        )}
      </div>
    </div>
  );
};