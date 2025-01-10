import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CyberTorusBackground } from '@/components/backgrounds/CyberTorusBackground';
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
          <button 
            onClick={handleCreateGame}
            className="w-full py-4 px-8 text-xl font-bold
                     bg-gradient-to-r from-cyan-500 to-blue-500
                     border border-cyan-400 rounded
                     hover:from-cyan-400 hover:to-blue-400
                     transition-all duration-300
                     shadow-[0_0_15px_rgba(34,211,238,0.5)]
                     hover:shadow-[0_0_30px_rgba(34,211,238,0.8)]"
          >
            <span className="relative z-10">CREATE GAME</span>
          </button>

          <div className="text-center my-2 text-cyan-500 font-mono">[OR]</div>

          {/* Join Game Button */}
          <button
            onClick={handleJoinGame}
            className="w-full py-4 px-8 text-xl font-bold
                     bg-transparent border-2 border-cyan-400 rounded
                     hover:bg-cyan-900/30
                     transition-all duration-300
                     shadow-[0_0_15px_rgba(34,211,238,0.3)]
                     hover:shadow-[0_0_30px_rgba(34,211,238,0.5)]"
          >
            <span className="relative z-10">JOIN GAME</span>
          </button>

          {/* Rules Link */}
          <a 
            href="/rules" 
            className="mt-4 text-cyan-400 hover:text-cyan-300 
                     transition-colors duration-300 
                     font-mono tracking-wider
                     flex items-center gap-2"
          >
            <span className="text-xs">&lt;</span>
            GAME RULES
            <span className="text-xs">/&gt;</span>
          </a>
        </div>

        {/* Version number */}
        <div className="absolute bottom-4 right-4 text-cyan-700 font-mono text-sm">
          v0.1.0
        </div>
      </div>
    </div>
  );
};