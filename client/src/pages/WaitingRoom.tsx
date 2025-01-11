import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMultiplayerGame } from '@/hooks/useMultiplayerGame';
import { NeonBillboard } from '@/components/display/NeonBillboard';
import { NeonGridBackground } from '@/components/backgrounds/NeonGridBackground';
import { logger } from '@/utils/logger';

export const WaitingRoom: React.FC = () => {
  const navigate = useNavigate();
  const { gameId: urlGameId } = useParams<{ gameId: string }>();
  const [copied, setCopied] = useState(false);
  const [timeoutProgress, setTimeoutProgress] = useState(100);
  const { 
    gameId, 
    gameState,
    playerNumber,
    error
  } = useMultiplayerGame();

  useEffect(() => {
    logger.debug('WaitingRoom state update', {
      component: 'WaitingRoom',
      data: {
        urlGameId,
        gameId,
        gameState,
        playerNumber,
        error
      }
    });

    if (gameState) {
      logger.info('Game started, navigating to game board', {
        component: 'WaitingRoom',
        data: { gameId, playerNumber }
      });
      navigate(`/game/${urlGameId}`);
    }
  }, [gameState, gameId, playerNumber, urlGameId]);

  useEffect(() => {
    if (error) {
      logger.error('WaitingRoom error', { error });
      navigate('/');
    }
  }, [error]);

  useEffect(() => {
    // Имитация таймаута ожидания
    const interval = setInterval(() => {
      setTimeoutProgress((prev) => Math.max(0, prev - 0.1));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = () => {
    logger.userAction('leaveWaitingRoom');
    navigate('/');
  };

  return (
    <div className="relative min-h-screen text-white overflow-hidden font-['Orbitron']">
      <NeonGridBackground />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        {/* Top Section - Status */}
        <div className="absolute top-0 left-0 right-0 p-4">
          <div className="flex justify-between items-center text-xs font-mono">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                <span className="text-cyan-400">SYSTEM ACTIVE</span>
              </div>
              <div className="text-white/30">|</div>
              <div className="text-white/50">ID: {playerNumber + 1}</div>
            </div>
            <div className="flex items-center gap-2 text-pink-400">
              <span>UPTIME:</span>
              <span className="font-bold">{Math.floor(timeoutProgress)}%</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-8"
        >
          {/* Title */}
          <div className="text-center space-y-1">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-light tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400"
            >
              WAITING ROOM
            </motion.h1>
            <div className="text-xs text-white/30 tracking-[0.3em]">
              ESTABLISHING CONNECTION
            </div>
          </div>

          {/* Game Code Display */}
          <NeonBillboard gameCode={urlGameId || ''} onCopy={handleCopy} />
          
          {/* Players Status */}
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-white/10">
            <div className="space-y-4">
              {/* Player 1 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                  <span className="text-cyan-400 text-sm tracking-wider">
                    PLAYER {playerNumber + 1}
                  </span>
                </div>
                <span className="text-xs text-cyan-400/50 tracking-wider">READY</span>
              </div>
              
              {/* Player 2 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                  <span className="text-pink-400 text-sm tracking-wider">
                    PLAYER 2
                  </span>
                </div>
                <span className="text-xs text-pink-400/50 tracking-wider animate-pulse">
                  CONNECTING...
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center">
            <button
              onClick={handleLeave}
              className="px-8 py-2 border border-red-500/30 rounded
                       text-red-500 hover:text-red-400 hover:border-red-400/50
                       transition-all duration-300 text-sm tracking-wider
                       hover:bg-red-500/10"
            >
              TERMINATE CONNECTION
            </button>
          </div>
        </motion.div>

        {/* Copy Notification */}
        <AnimatePresence>
          {copied && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-4 right-4 bg-green-500/20 text-green-400 
                       px-4 py-2 rounded backdrop-blur-sm border border-green-500/30
                       text-sm"
            >
              Code copied to clipboard!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Section - System Info */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex justify-between items-center text-xs font-mono text-white/30">
            <div>VERSION: 13.5.89</div>
            <div>PROTOCOL: TCP/QUANTUM</div>
            <div>SECURITY: RSA-4096</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-500 to-pink-500"
          style={{ width: timeoutProgress + '%' }}
        />
      </div>
    </div>
  );
};