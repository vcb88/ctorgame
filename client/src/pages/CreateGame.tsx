import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useMultiplayerGame } from '@/hooks/useMultiplayerGame';
import { logger } from '@/utils/logger';

export const CreateGame: React.FC = () => {
  const navigate = useNavigate();
  const { gameId, createGame } = useMultiplayerGame();

  useEffect(() => {
    if (!gameId) {
      createGame();
    }
  }, []);

  useEffect(() => {
    if (gameId) {
      navigate(`/waiting/${gameId}`);
    }
  }, [gameId]);

  const handleCancel = () => {
    logger.userAction('cancelCreateGame');
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl mb-8">Creating new game...</h2>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-8"></div>
      <Button
        variant="outline"
        onClick={handleCancel}
      >
        Cancel
      </Button>
    </div>
  );
};