import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IronCityBackground } from '@/components/backgrounds/IronCityBackground';
import { useMultiplayerGame } from '@/hooks/useMultiplayerGame';
import { logger } from '@/utils/logger.js';

export const CreateGame: React.FC = () => {
  const navigate = useNavigate();
  const { gameId, createGame, connectionState } = useMultiplayerGame();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Connecting to server...');

  useEffect(() => {
    logger.info('CreateGame effect triggered', {
      component: 'CreateGame',
      data: { gameId, connectionState }
    });
    
    let interval: NodeJS.Timeout | null = null;

    if (!gameId && connectionState === 'CONNECTED') {
      logger.info('Initiating game creation', {
        component: 'CreateGame',
        data: { connectionState }
      });
      createGame();
      // Симуляция прогресса создания игры
      const stages = [
        'Connecting to mainframe...',
        'Generating quantum entanglement...',
        'Initializing game matrix...',
        'Establishing neural links...',
        'Synchronizing parallel universes...',
        'Creating game instance...'
      ];
      
      let currentStage = 0;
      interval = setInterval(() => {
        if (currentStage < stages.length) {
          setStatus(stages[currentStage]);
          setProgress((currentStage + 1) * (100 / stages.length));
          currentStage++;
        }
      }, 800);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [gameId, connectionState, createGame]);

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
    <div className="relative min-h-screen text-cyan-50 overflow-hidden">
      <IronCityBackground />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
        {/* Holographic Container */}
        <div className="relative bg-black/30 backdrop-blur-sm p-8 rounded-lg border border-cyan-500/30 max-w-md w-full">
          {/* Holographic Effect Corners */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-pink-500 rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-pink-500 rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-pink-500 rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-pink-500 rounded-br-lg" />
          
          {/* Content */}
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500">
              Creating Neural Game Instance
            </h2>
            
            {/* Connection Status */}
            <div className="font-mono text-sm text-cyan-400">
              {connectionState !== 'CONNECTED' ? `Connecting to server (${connectionState})...` : status}
            </div>
            
            {/* Progress Bar */}
            <div className="relative h-2 bg-black/50 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-pink-500 to-cyan-500 transition-all duration-300"
                style={{ width: progress + '%' }}
              />
            </div>
            
            {/* Loading Animation */}
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20" />
              <div 
                className="absolute inset-0 rounded-full border-4 border-t-cyan-500 animate-spin"
                style={{ animationDuration: '2s' }}
              />
              <div 
                className="absolute inset-2 rounded-full border-4 border-pink-500/20"
              />
              <div 
                className="absolute inset-2 rounded-full border-4 border-t-pink-500 animate-spin"
                style={{ animationDuration: '1.5s' }}
              />
            </div>
            
            {/* Cancel Button */}
            <button
              onClick={handleCancel}
              className="px-6 py-2 bg-black/30 border border-pink-500/50 rounded
                       text-pink-500 hover:text-pink-400 hover:border-pink-400
                       transition-all duration-300
                       hover:shadow-[0_0_15px_rgba(236,72,153,0.5)]"
            >
              TERMINATE PROCESS
            </button>
          </div>
        </div>
        
        {/* System Info */}
        <div className="absolute bottom-4 right-4 font-mono text-xs text-cyan-700">
          <div>SYS://neural-engine/v2.5.0</div>
          <div>CORE://quantum-matrix/active</div>
        </div>
      </div>
    </div>
  );
};