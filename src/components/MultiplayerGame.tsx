import React, { useEffect, useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import ExtendedGrid from './ExtendedGrid';
import { ScoreBoard } from './ScoreBoard';
import { GameOverDialog } from './ui/gameover-dialog';
import { Player, GameState as NewGameState, Position } from '../types/game';
import { createInitialState, applyMove } from '../game/rules';
import '../styles/ScoreBoard.css';

interface MultiplayerGameProps {
    gameId: string;
    playerNumber: number;
    onGameEnd?: () => void;
}

export const MultiplayerGame: React.FC<MultiplayerGameProps> = ({
    gameId,
    playerNumber,
    onGameEnd
}) => {
    const [gameState, setGameState] = useState<NewGameState>(createInitialState());
    const [showGameOver, setShowGameOver] = useState(false);
    const [gameOverMessage, setGameOverMessage] = useState('');
    const isMyTurn = gameState.currentPlayer === playerNumber;

    const { socket } = useSocket({
        onGameUpdated: (gameId, update) => {
            if (update.lastMove) {
                const result = applyMove(gameState, {
                    x: update.lastMove.col,
                    y: update.lastMove.row
                });
                
                if (result.isValid) {
                    setGameState(prevState => ({
                        ...prevState,
                        board: result.captures.reduce((board, capture) => {
                            capture.positions.forEach(pos => {
                                board[pos.x][pos.y] = capture.player;
                            });
                            return board;
                        }, prevState.board.map(row => [...row])),
                        currentPlayer: result.nextPlayer,
                        opsRemaining: result.opsRemaining,
                        score: {
                            [Player.First]: prevState.board.flat().filter(cell => cell === Player.First).length,
                            [Player.Second]: prevState.board.flat().filter(cell => cell === Player.Second).length
                        }
                    }));

                    if (result.isGameOver) {
                        const winnerMessage = result.winner
                            ? `Player ${result.winner} wins!`
                            : 'Game ended in a draw!';
                        setGameOverMessage(winnerMessage);
                        setShowGameOver(true);
                    }
                }
            }
        },
        onPlayerLeft: () => {
            setGameOverMessage('Opponent left the game');
            setShowGameOver(true);
        },
        onPlayerDisconnected: () => {
            setGameOverMessage('Opponent disconnected');
            setShowGameOver(true);
        }
    });

    const handleCellClick = (x: number, y: number) => {
        if (!isMyTurn || gameState.board[x][y] !== Player.None || gameState.opsRemaining <= 0) {
            return;
        }

        const result = applyMove(gameState, { x, y });
        if (!result.isValid) {
            return;
        }

        // Emit move to server
        socket.emit('makeMove', {
            gameId,
            playerNumber,
            x,
            y,
            captures: result.captures
        });

        // Update local state
        setGameState(prevState => ({
            ...prevState,
            board: result.captures.reduce((board, capture) => {
                capture.positions.forEach(pos => {
                    board[pos.x][pos.y] = capture.player;
                });
                return board;
            }, prevState.board.map(row => [...row])),
            currentPlayer: result.nextPlayer,
            opsRemaining: result.opsRemaining,
            score: {
                [Player.First]: prevState.board.flat().filter(cell => cell === Player.First).length,
                [Player.Second]: prevState.board.flat().filter(cell => cell === Player.Second).length
            }
        }));

        if (result.isGameOver) {
            const winnerMessage = result.winner
                ? `Player ${result.winner} wins!`
                : 'Game ended in a draw!';
            setGameOverMessage(winnerMessage);
            setShowGameOver(true);
        }
    };

    const handleGameOverClose = () => {
        setShowGameOver(false);
        if (onGameEnd) {
            onGameEnd();
        }
    };

    const convertedBoard = gameState.board.map(row =>
        row.map(cell => {
            switch (cell) {
                case Player.None: return 0;
                case Player.First: return 1;
                case Player.Second: return 2;
                default: return 0;
            }
        })
    );

    return (
        <div className="multiplayer-game">
            <ScoreBoard
                scores={gameState.score}
                currentPlayer={gameState.currentPlayer}
                opsRemaining={gameState.opsRemaining}
            />

            <ExtendedGrid
                board={convertedBoard}
                onCellClick={handleCellClick}
                showMap={false}
                scores={[]}
            />

            <GameOverDialog
                isOpen={showGameOver}
                message={gameOverMessage}
                onClose={handleGameOverClose}
            />
        </div>
    );
};