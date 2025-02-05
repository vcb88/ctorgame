import React, { useState, useCallback } from 'react';
import { useSocket } from '../hooks/useSocket';

interface GameLobbyProps {
    onGameStart: (gameId: string, playerNumber: number) => void;
}

export const GameLobby: React.FC<GameLobbyProps> = ({ onGameStart }) => {
    const [joinCode, setJoinCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { socket } = useSocket({
        onGameCreated: (gameId, _, playerNumber) => {
            setIsLoading(false);
            onGameStart(gameId, playerNumber);
        },
        onGameJoined: (gameId, playerNumber) => {
            setIsLoading(false);
            onGameStart(gameId, playerNumber);
        },
        onError: (errorMsg) => {
            setIsLoading(false);
            setError(errorMsg);
        }
    });

    const handleCreateGame = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            socket.emit('createGame', {
                type: 'createGame'
            });
        } catch (err) {
            setError('Failed to create game');
            console.error('Create game error:', err);
        }
    }, [socket]);

    const handleJoinGame = useCallback(async () => {
        try {
            if (!joinCode) {
                setError('Please enter game code');
                return;
            }

            setIsLoading(true);
            setError(null);
            
            socket.emit('joinGame', {
                type: 'joinGame',
                code: joinCode
            });
        } catch (err) {
            setError('Failed to join game');
            console.error('Join game error:', err);
        }
    }, [joinCode, socket]);



    return (
        <div className="game-lobby">
            <h2>Game Lobby</h2>
            
            {error && (
                <div className="error-message" role="alert">
                    {error}
                </div>
            )}
            
            <div className="lobby-actions">
                <button 
                    onClick={handleCreateGame}
                    disabled={isLoading}
                    className="create-game-btn"
                >
                    {isLoading ? 'Creating...' : 'Create New Game'}
                </button>
                
                <div className="join-game-section">
                    <h3>Join Existing Game</h3>
                    <div className="join-game-form">
                        <input
                            type="text"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value.slice(0, 4))}
                            placeholder="Enter 4-digit code"
                            maxLength={4}
                            pattern="[0-9]*"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleJoinGame}
                            disabled={isLoading || !joinCode}
                            className="join-game-btn"
                        >
                            {isLoading ? 'Joining...' : 'Join Game'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};