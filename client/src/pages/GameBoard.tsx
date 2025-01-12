import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMultiplayerGame } from '@/hooks/useMultiplayerGame';
import { OperationType } from '@ctor-game/shared';
import { GameCell } from '@/components/GameCell';
import { TurnTimer } from '@/components/TurnTimer';
import { DisconnectionOverlay } from '@/components/modals/DisconnectionOverlay';
import { logger } from '@/utils/logger';
import { cn } from '@/lib/utils';
import { GameOverScreen } from '@/components/GameOverScreen';

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

  const TURN_DURATION = 30; // seconds
  const [validMoves, setValidMoves] = useState<{ [key: string]: boolean }>({});
  const [capturedCells, setCapturedCells] = useState<{ [key: string]: boolean }>({});
  const [previousBoard, setPreviousBoard] = useState<(number | null)[][]>([]);

  // Update valid moves whenever the board state changes
  useEffect(() => {
    if (!gameState || !isMyTurn) {
      setValidMoves({});
      return;
    }

    const moves: { [key: string]: boolean } = {};
    gameState.board.cells.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === null) {
          moves[`${rowIndex}-${colIndex}`] = true;
        }
      });
    });
    setValidMoves(moves);
  }, [gameState?.board.cells, isMyTurn]);

  // Track cell captures by comparing previous and current board states
  useEffect(() => {
    if (!gameState?.board.cells) return;

    const captures: { [key: string]: boolean } = {};
    gameState.board.cells.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const prevValue = previousBoard[rowIndex]?.[colIndex];
        if (prevValue !== undefined && prevValue !== null && cell !== prevValue) {
          captures[`${rowIndex}-${colIndex}`] = true;
        }
      });
    });
    
    setCapturedCells(captures);
    setPreviousBoard(gameState.board.cells);
  }, [gameState?.board.cells]);

  useEffect(() => {
    logger.debug('GameBoard mounted', { 
      component: 'GameBoard',
      data: {
        urlGameId,
        gameId,
        playerNumber,
        gameState: !!gameState
      }
    });

    // Если мы попали на страницу напрямую или потеряли состояние,
    // пытаемся переподключиться к игре
    if (urlGameId && (!gameState || gameId !== urlGameId)) {
      logger.info('Attempting to reconnect to game', {
        component: 'GameBoard',
        data: { urlGameId, currentGameId: gameId }
      });
      navigate(`/waiting/${urlGameId}`);
    }

    return () => {
      logger.debug('GameBoard unmounted', { 
        component: 'GameBoard' 
      });
    };
  }, [urlGameId, gameId, gameState, playerNumber]);

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

          <div className="flex justify-between items-center mb-4">
            <TurnTimer
              duration={TURN_DURATION}
              isActive={isMyTurn}
              className="mr-4"
            />
            <div className="grid grid-cols-10 gap-1 bg-black/90 p-2 rounded border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.2)] flex-1">
              {gameState.board.cells.map((row: (number | null)[], rowIndex: number) =>
                row.map((cell: number | null, colIndex: number) => (
                  <GameCell
                    key={`${rowIndex}-${colIndex}`}
                    row={rowIndex}
                    col={colIndex}
                    value={cell}
                    disabled={!isMyTurn || cell !== null || gameState.gameOver || gameState.currentTurn.placeOperationsLeft <= 0}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    isValidMove={validMoves[`${rowIndex}-${colIndex}`]}
                    isBeingCaptured={capturedCells[`${rowIndex}-${colIndex}`]}
                    previousValue={previousBoard[rowIndex]?.[colIndex]}
                  />
                ))
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center font-mono">
            <div className="px-4 py-2 bg-black/80 border border-cyan-500/30 rounded text-center shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              {gameState.isFirstTurn ? "First turn: 1 placement only" : "Regular turn: 2 placements"}
            </div>
          </div>
        </div>

        {gameState.gameOver && (
          <GameOverScreen
            winner={gameState.winner}
            scores={gameState.scores}
            onReturnToMenu={() => navigate('/')}
          />
        )}
      </div>
    </div>
  );
};