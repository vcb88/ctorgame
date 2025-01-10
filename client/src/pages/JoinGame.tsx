import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useMultiplayerGame } from '@/hooks/useMultiplayerGame';
import { logger } from '@/utils/logger';

export const JoinGame: React.FC = () => {
  const navigate = useNavigate();
  const [gameCode, setGameCode] = useState('');
  const { joinGame, error } = useMultiplayerGame();

  const handleJoin = async () => {
    if (!gameCode.trim()) return;
    
    logger.userAction('joinGameAttempt', { gameCode });
    const success = await joinGame(gameCode);
    if (success) {
      navigate(`/waiting/${gameCode}`);
    }
  };

  const handleBack = () => {
    logger.userAction('cancelJoinGame');
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-md px-4">
        <h2 className="text-2xl mb-8 text-center">Join Game</h2>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="gameCode" className="text-sm font-medium">
              Enter Game Code:
            </label>
            <input
              id="gameCode"
              type="text"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value)}
              className="border p-3 rounded-lg text-lg w-full"
              placeholder="Enter code here"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleJoin}
            disabled={!gameCode.trim()}
          >
            Join
          </Button>

          <Button
            variant="outline"
            onClick={handleBack}
          >
            Back
          </Button>
        </div>
      </div>
    </div>
  );
};