import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CyberTorusBackground } from '@/components/backgrounds/CyberTorusBackground';
import { logger } from '@/utils/logger.js';
import { CyberButton } from '@/components/ui/cyber-button.js';

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
    <div className="relative min-h-screen overflow-hidden text-cyan-50">
      <CyberTorusBackground />
      
      {/* Glowing overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black opacity-50" />
      
      <div className="relative flex flex-col items-center justify-center min-h-screen gap-8 px-4">
        {/* Title with cyber effect */}
        <div className="text-center relative">
          <h1 className="text-6xl font-bold mb-2 relative 
                         text-transparent bg-clip-text bg-gradient-to-r 
                         from-cyan-400 via-cyan-300 to-blue-500
                         animate-pulse">
            CTOR GAME
          </h1>
          <div className="text-sm font-mono text-cyan-400 tracking-widest">
            ENTER THE GRID
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-6 w-full max-w-md relative">
          {/* Create Game Button */}
          <CyberButton
            onClick={handleCreateGame}
            variant="primary"
            size="lg"
            glowing
            className="w-full font-bold"
          >
            CREATE GAME
          </CyberButton>

          <div className="text-center my-2 text-cyan-500 font-mono">[OR]</div>

          {/* Join Game Button */}
          <CyberButton
            onClick={handleJoinGame}
            variant="secondary"
            size="lg"
            glowing
            className="w-full font-bold"
          >
            JOIN GAME
          </CyberButton>

          {/* Additional Navigation */}
          <div className="flex flex-col items-center gap-4 mt-8">
            <CyberButton
              onClick={() => {
                logger.userAction('rulesClick');
                navigate('/rules');
              }}
              variant="ghost"
              glowing
              withTags
            >
              GAME RULES
            </CyberButton>

            <CyberButton
              onClick={() => {
                logger.userAction('historyClick');
                navigate('/history');
              }}
              variant="ghost"
              glowing
              withTags
            >
              GAME HISTORY
            </CyberButton>

            <CyberButton
              onClick={() => {
                logger.userAction('settingsClick');
                navigate('/settings');
              }}
              variant="ghost"
              glowing
              withTags
            >
              SETTINGS
            </CyberButton>
          </div>
        </div>

        {/* Version number and System Info */}
        <div className="absolute bottom-4 right-4 text-right">
          <div className="text-cyan-700 font-mono text-sm mb-1">v0.1.0</div>
          <div className="text-cyan-900 font-mono text-xs">SYSTEM://LOADED</div>
        </div>
      </div>
    </div>
  );
};