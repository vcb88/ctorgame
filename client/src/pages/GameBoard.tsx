import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
const BOARD_SIZE = 10; // temporary constant until we fix the import
import { 
    type Position, 
    type PlayerNumber, 
    type MoveType, 
    type CellValue,
    type GameError
} from '@ctor-game/shared/types/core.js';
import type { GameState } from '@/types/game-state.js';
import { useMultiplayerGame } from '@/hooks/useMultiplayerGame.js';
import { GameCell } from '@/components/GameCell.js';
import { TurnTimer } from '@/components/TurnTimer.js';
import { DisconnectionOverlay } from '@/components/modals/DisconnectionOverlay.js';
import { logger } from '@/utils/logger.js';
import { GameOverScreen } from '@/components/GameOverScreen.js';

type ValidMovesMap = { [key: string]: boolean };
type CapturedCellsMap = { [key: string]: boolean };

const TURN_DURATION = 30; // seconds

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

    const [validMoves, setValidMoves] = useState<ValidMovesMap>({});
    const [capturedCells, setCapturedCells] = useState<CapturedCellsMap>({});
    const [previousBoard, setPreviousBoard] = useState<CellValue[][]>([]);

    // Update valid moves whenever the board state changes
    useEffect(() => {
        if (!gameState || !isMyTurn) {
            setValidMoves({});
            return;
        }

        const moves: ValidMovesMap = {};
        for (let rowIndex = 0; rowIndex < BOARD_SIZE; rowIndex++) {
            for (let colIndex = 0; colIndex < BOARD_SIZE; colIndex++) {
                if (gameState.board[rowIndex][colIndex] === null) {
                    moves[`${rowIndex}-${colIndex}`] = true;
                }
            }
        }
        setValidMoves(moves);
    }, [gameState?.board, isMyTurn]);

    // Track cell captures by comparing previous and current board states
    useEffect(() => {
        if (!gameState?.board) return;

        const captures: CapturedCellsMap = {};
        for (let rowIndex = 0; rowIndex < BOARD_SIZE; rowIndex++) {
            for (let colIndex = 0; colIndex < BOARD_SIZE; colIndex++) {
                const cell = gameState.board[rowIndex][colIndex];
                const prevValue = previousBoard[rowIndex]?.[colIndex];
                if (prevValue !== undefined && prevValue !== null && cell !== prevValue) {
                    captures[`${rowIndex}-${colIndex}`] = true;
                }
            }
        }
        
        setCapturedCells(captures);
        const newBoard = Array.from({length: BOARD_SIZE}, (_, row) => 
            Array.from({length: BOARD_SIZE}, (_, col) => gameState.board[row][col]));
        setPreviousBoard(newBoard);
    }, [gameState?.board]);

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

        // Try to reconnect if we lost state or accessed the page directly
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
            logger.error('GameBoard error occurred', { component: 'GameBoard', data: error });
        }
    }, [error]);

    const handleCellClick = useCallback((row: number, col: number) => {
        if (!isMyTurn || !gameState) {
            logger.debug('Cell click ignored - not player\'s turn', {
                component: 'GameBoard',
                data: { row, col, currentPlayer: gameState?.currentPlayer }
            });
            return;
        }

        const pos: Position = [row, col];
        const cellValue = gameState.board[row][col];

        if (cellValue !== null) {
            logger.debug('Cell click ignored - cell not empty', {
                component: 'GameBoard',
                data: { row, col, cellValue }
            });
            return;
        }

        if (gameState.phase === 'end') {
            logger.debug('Cell click ignored - game is over', {
                component: 'GameBoard',
                data: { row, col }
            });
            return;
        }

        if (gameState.currentTurn.placeOperations <= 0) {
            logger.debug('Cell click ignored - no moves left', {
                component: 'GameBoard',
                data: { row, col, operationsLeft: gameState.currentTurn.placeOperations }
            });
            return;
        }

        logger.userAction('makeMove', { row, col, type: 'place' });
        makeMove(row, col, 'place');
    }, [isMyTurn, gameState, makeMove]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="text-red-500 text-xl mb-4">{error.message}</div>
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

    const formatPlayerSymbol = (num: PlayerNumber | null | undefined) => !num ? '?' : (num === 1 ? 'X' : 'O');

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-black text-cyan-400">
            <div className="max-w-4xl w-full">
                <div className="flex justify-between items-center mb-6">
                    <div className="text-xl font-mono">
                        Game ID: <span className="text-cyan-300">{gameId}</span>
                    </div>
                    <div className="text-xl font-mono">
                        You: Player {formatPlayerSymbol(playerNumber)}
                    </div>
                </div>

                <div className="text-xl mb-6 text-center font-bold">
                    {gameState.phase === 'end'
                        ? gameState.winner !== null
                            ? `Player ${formatPlayerSymbol(gameState.winner)} wins!`
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
                                <span>Player 1: {gameState.scores[0]}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-red-500 rounded-sm shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
                                <span>Player 2: {gameState.scores[1]}</span>
                            </div>
                        </div>
                        <div className="text-cyan-300">
                            Operations left: {gameState.currentTurn.placeOperations}
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-4">
                        <TurnTimer
                            duration={TURN_DURATION}
                            isActive={isMyTurn}
                            className="mr-4"
                        />
                        <div className="grid grid-cols-10 gap-1 bg-black/90 p-2 rounded border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.2)] flex-1">
                            {Array.from({ length: BOARD_SIZE }, (_, rowIndex) =>
                                Array.from({ length: BOARD_SIZE }, (_, colIndex) => {
                                    const cell = gameState.board[rowIndex][colIndex];
                                    return (
                                        <GameCell
                                            key={`${rowIndex}-${colIndex}`}
                                            value={cell}
                                            position={[rowIndex, colIndex] as Position}
                                            disabled={!isMyTurn || cell !== null || gameState.phase === 'end' || gameState.currentTurn.placeOperations <= 0}
                                            onClick={() => handleCellClick(rowIndex, colIndex)}
                                            isValidMove={validMoves[`${rowIndex}-${colIndex}`]}
                                            captured={capturedCells[`${rowIndex}-${colIndex}`]}
                                            previousValue={previousBoard[rowIndex]?.[colIndex]}
                                        />
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-center font-mono">
                        <div className="px-4 py-2 bg-black/80 border border-cyan-500/30 rounded text-center shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                            {gameState.isFirstTurn ? "First turn: 1 placement only" : "Regular turn: 2 placements"}
                        </div>
                    </div>
                </div>

                {gameState.phase === 'end' && (
                    <GameOverScreen
                        winner={gameState.winner ?? null}
                        scores={gameState.scores}
                        onReturnToMenu={() => navigate('/')}
                    />
                )}
            </div>
        </div>
    );
};