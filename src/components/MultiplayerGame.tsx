import React, { useEffect, useReducer, useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import ExtendedGrid from './ExtendedGrid';
import { GameOverDialog } from './ui/gameover-dialog';
import { P, A, GameState, GameAction, Board } from '@/types';
import { GRID_WIDTH, GRID_HEIGHT } from '@/constants';

interface MultiplayerGameProps {
    gameId: string;
    playerNumber: number;
    onGameEnd?: () => void;
}

const initialState: GameState = {
    board: Array(GRID_WIDTH).fill(null).map(() => Array(GRID_HEIGHT).fill(P.N)),
    p: P.A,
    ops: 2
};

export const MultiplayerGame: React.FC<MultiplayerGameProps> = ({
    gameId,
    playerNumber,
    onGameEnd
}) => {
    const { socket } = useSocket({
        onGameUpdated: (gameId, update) => {
            if (update.currentPlayer) {
                setIsMyTurn(update.currentPlayer === playerNumber);
            }
            if (update.lastMove) {
                dispatch({
                    type: A.PL,
                    x: update.lastMove.col,
                    y: update.lastMove.row,
                    p: playerNumber === 1 ? P.B : P.A
                });
                dispatch({ type: A.RP });
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
    const [state, dispatch] = useReducer(reducer, initialState);
    const [showGameOver, setShowGameOver] = useState(false);
    const [gameOverMessage, setGameOverMessage] = useState('');
    const [isMyTurn, setIsMyTurn] = useState(playerNumber === 1);



    const handleCellClick = (x: number, y: number) => {
        if (!isMyTurn || state.board[x][y] !== P.N || state.ops <= 0) {
            return;
        }

        // Emit move to server
        socket.emit('makeMove', {
            type: 'makeMove',
            gameId,
            playerNumber,
            x,
            y
        });

        // Local state update
        dispatch({
            type: A.PL,
            x,
            y,
            p: playerNumber === 1 ? P.A : P.B
        });
        dispatch({ type: A.RP });

        if (state.ops <= 1) {
            dispatch({ type: A.ET });
        }
    };

    const handleGameOverClose = () => {
        setShowGameOver(false);
        if (onGameEnd) {
            onGameEnd();
        }
    };

    return (
        <div className="multiplayer-game">
            <div className="game-status">
                <div className="player-info">
                    You are Player {playerNumber}
                    {isMyTurn && <span className="your-turn">Your turn!</span>}
                </div>
                <div className="game-stats">
                    <span>Operations left: {state.ops}</span>
                    <span>P1 Score: {state.board.flat().filter(c => c === P.A).length}</span>
                    <span>P2 Score: {state.board.flat().filter(c => c === P.B).length}</span>
                </div>
            </div>

            <ExtendedGrid
                board={state.board}
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