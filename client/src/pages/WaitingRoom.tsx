import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useMultiplayerGame } from '@/hooks/useMultiplayerGame';
import { logger } from '@/utils/logger';

export const WaitingRoom: React.FC = () => {
  const navigate = useNavigate();
  const { gameId: urlGameId } = useParams<{ gameId: string }>();
  const { 
    gameId, 
    gameState,
    playerNumber,
    error
  } = useMultiplayerGame();

  useEffect(() => {
    if (gameState) {
      navigate(`/game/${gameId}`);
    }
  }, [gameState]);

  useEffect(() => {
    if (error) {
      logger.error('WaitingRoom error', { error });
      navigate('/');
    }
  }, [error]);

  const handleLeave = () => {
    logger.userAction('leaveWaitingRoom');
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl mb-4">Waiting Room</h2>
      
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm mb-8">
        <p className="text-center mb-2">Game Code:</p>
        <div className="bg-white px-6 py-3 rounded font-mono text-xl text-center">
          {urlGameId}
        </div>
      </div>

      <div className="flex flex-col gap-4 items-center mb-8">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Player {playerNumber + 1}: Ready</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-300 animate-pulse"></div>
          <span>Waiting for opponent...</span>
        </div>
      </div>

      <Button
        variant="outline"
        onClick={handleLeave}
      >
        Leave Room
      </Button>
    </div>
  );
};