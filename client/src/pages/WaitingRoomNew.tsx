import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/hooks/useGame';
import { NeonBillboard } from '@/components/display/NeonBillboard';
import { NeonGridBackground } from '@/components/backgrounds/NeonGridBackground';
import { logger } from '@/utils/logger';
import { Player } from '@ctor-game/shared';
import { GameStateManager } from '@/services/GameStateManager';
import { JoinGameError } from '@/types/gameManager';

// Number of retries for joining a game
const MAX_JOIN_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

export const WaitingRoomNew: React.FC = () => {
  const navigate = useNavigate();
  const { gameId: urlGameId } = useParams<{ gameId: string }>();
  
  // UI state
  const [copied, setCopied] = useState(false);
  const [timeoutProgress, setTimeoutProgress] = useState(100);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Get game state from GameStateManager
  const { state } = useGame();
  const { playerNumber, gameState, error } = state;

  // Retry logic for joining game
  const joinWithRetry = async (gameId: string, retryCount: number = 0) => {
    try {
      setIsJoining(true);
      setJoinError(null);
      
      const manager = GameStateManager.getInstance();
      await manager.joinGame(gameId);
      
      setIsJoining(false);
      setRetryCount(0);
    } catch (err) {
      const error = err as JoinGameError;
      logger.error('Failed to join game', { error, retryCount });
      
      if (retryCount < MAX_JOIN_RETRIES) {
        setRetryCount(retryCount + 1);
        setTimeout(() => {
          joinWithRetry(gameId, retryCount + 1);
        }, RETRY_DELAY);
      } else {
        setIsJoining(false);
        setJoinError(error.message || 'Failed to join game');
        navigate('/');
      }
    }
  };

  // Initial join attempt
  useEffect(() => {
    if (urlGameId && !isJoining && !gameState) {
      joinWithRetry(urlGameId);
    }
  }, [urlGameId]);

  // Navigate to game when ready
  useEffect(() => {
    logger.debug('WaitingRoom state update', {
      component: 'WaitingRoomNew',
      data: {
        urlGameId,
        playerNumber,
        gameState,
        error
      }
    });

    if (gameState) {
      logger.info('Game started, navigating to game board', {
        component: 'WaitingRoomNew',
        data: { 
          urlGameId, 
          playerNumber,
          gameState,
          currentUrl: window.location.pathname
        }
      });
      navigate(`/game/${urlGameId}`);
    }
  }, [gameState, playerNumber, urlGameId]);

  // Handle global errors
  useEffect(() => {
    if (error) {
      logger.error('WaitingRoom error', { error });
      
      // Add delay before navigation to show error message
      const timer = setTimeout(() => {
        navigate('/');
      }, 3000); // Wait 3 seconds before redirecting
      
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Progress animation
  const animationFrameRef = useRef<number>();
  const lastUpdateRef = useRef<number>(Date.now());
  const progressRef = useRef<number>(100);

  useEffect(() => {
    const updateProgress = () => {
      const now = Date.now();
      const delta = now - lastUpdateRef.current;
      lastUpdateRef.current = now;

      progressRef.current = Math.max(0, progressRef.current - (delta * 0.001));
      setTimeoutProgress(Math.floor(progressRef.current));

      animationFrameRef.current = requestAnimationFrame(updateProgress);
    };

    animationFrameRef.current = requestAnimationFrame(updateProgress);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      const manager = GameStateManager.getInstance();
      manager.disconnect();
    };
  }, []);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = () => {
    logger.userAction('leaveWaitingRoom');
    const manager = GameStateManager.getInstance();
    manager.disconnect();
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
                <div className={`w-2 h-2 rounded-full ${isJoining ? 'bg-yellow-500' : 'bg-cyan-500'} animate-pulse`} />
                <span className={isJoining ? 'text-yellow-400' : 'text-cyan-400'}>
                  {isJoining ? 'CONNECTING' : 'SYSTEM ACTIVE'}
                </span>
              </div>
              <div className="text-white/30">|</div>
              <div className="text-white/50">
                {playerNumber !== null ? `ID: ${playerNumber + 1}` : 'INITIALIZING'}
              </div>
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
              {isJoining ? 'ESTABLISHING CONNECTION' : 'WAITING FOR OPPONENT'}
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
                    {playerNumber === Player.First ? 'PLAYER 1' : 'PLAYER 2'}
                  </span>
                </div>
                <span className="text-xs text-cyan-400/50 tracking-wider">READY</span>
              </div>
              
              {/* Player 2 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                  <span className="text-pink-400 text-sm tracking-wider">
                    {playerNumber === Player.First ? 'PLAYER 2' : 'PLAYER 1'}
                  </span>
                </div>
                <span className="text-xs text-pink-400/50 tracking-wider animate-pulse">
                  {isJoining ? 'CONNECTING...' : 'WAITING...'}
                </span>
              </div>

              {/* Retry Status */}
              {retryCount > 0 && (
                <div className="mt-4 text-xs text-yellow-400">
                  Connection attempt {retryCount}/{MAX_JOIN_RETRIES}...
                </div>
              )}
            </div>
          </div>

          {/* Error Display */}
          {(joinError || error?.message) && (
            <div className="bg-red-500/20 text-red-400 px-4 py-2 rounded text-sm text-center">
              {joinError || error?.message}
            </div>
          )}

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