import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { logger } from '@/utils/logger';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  
  const handleCreateGame = () => {
    logger.userAction('createGameClick');
    navigate('/create');
  };

  const handleJoinGame = () => {
    logger.userAction('joinGameClick');
    navigate('/join');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8">
      <h1 className="text-4xl font-bold mb-8">CTOR GAME</h1>
      
      <div className="flex flex-col items-center gap-4 w-full max-w-md">
        <Button 
          className="w-full py-6 text-xl"
          onClick={handleCreateGame}
        >
          CREATE GAME
        </Button>

        <div className="text-center my-2">- OR -</div>

        <Button
          className="w-full py-6 text-xl"
          variant="secondary"
          onClick={handleJoinGame}
        >
          JOIN GAME
        </Button>

        <a 
          href="/rules" 
          className="mt-4 text-blue-500 hover:underline"
        >
          Game Rules
        </a>
      </div>
    </div>
  );
};