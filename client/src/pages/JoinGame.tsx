import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DeepSpaceBackground } from '@/components/backgrounds/DeepSpaceBackground';
import { useMultiplayerGame } from '@/hooks/useMultiplayerGame';
import { logger } from '@/utils/logger';

export const JoinGame: React.FC = () => {
  const navigate = useNavigate();
  const [gameCode, setGameCode] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const { joinGame, error } = useMultiplayerGame();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Автофокус на поле ввода
    inputRef.current?.focus();
  }, []);

  const handleJoin = async () => {
    if (!gameCode.trim()) return;
    
    setIsAnimating(true);
    logger.userAction('joinGameAttempt', { gameCode });
    
    const success = await joinGame(gameCode);
    if (success) {
      // Добавляем задержку для анимации
      setTimeout(() => {
        navigate(`/waiting/${gameCode}`);
      }, 1000);
    } else {
      setIsAnimating(false);
    }
  };

  const handleBack = () => {
    logger.userAction('cancelJoinGame');
    navigate('/');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && gameCode.trim()) {
      handleJoin();
    }
  };

  return (
    <div className="relative min-h-screen text-blue-50 overflow-hidden font-['Orbitron',sans-serif]">
      <DeepSpaceBackground />
      
      {/* Scanner Effect */}
      <div 
        className={'absolute inset-0 pointer-events-none ' + 
                   (isAnimating ? 'animate-scan' : '')}
        style={{
          background: 'linear-gradient(transparent, rgba(64, 156, 255, 0.2), transparent)',
          backgroundSize: '100% 200%',
          animation: isAnimating ? 'scan 2s ease-in-out infinite' : 'none'
        }}
      />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Main Container */}
        <div className="relative max-w-md w-full">
          {/* Floating Elements */}
          <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-full">
            <div className="text-center space-y-1">
              <div className="text-xs text-blue-400 tracking-[0.3em]">AQUILA RIFT</div>
              <div className="text-2xl font-light tracking-[0.2em] text-blue-300">JUMP GATE</div>
              <div className="text-xs text-blue-500 tracking-[0.2em]">V2.5.0//:STABLE</div>
            </div>
          </div>

          {/* Main Interface */}
          <div className={'relative bg-black/30 backdrop-blur-sm p-8 rounded-lg ' +
                        'border border-blue-500/30 transform transition-all duration-500 ' +
                        (isAnimating ? 'scale-105 border-blue-400/60' : '')}>
            
            {/* Interface Details */}
            <div className="absolute top-0 left-0 w-20 h-1 bg-blue-500/50" />
            <div className="absolute top-0 right-0 w-20 h-1 bg-blue-500/50" />
            <div className="absolute bottom-0 left-0 w-20 h-1 bg-blue-500/50" />
            <div className="absolute bottom-0 right-0 w-20 h-1 bg-blue-500/50" />
            
            {/* Content */}
            <div className="space-y-8">
              {/* Input Field */}
              <div className="space-y-2">
                <label className="block text-xs text-blue-400 tracking-[0.2em]">
                  ENTER JUMP COORDINATES
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                  onKeyPress={handleKeyPress}
                  maxLength={6}
                  className={'w-full bg-black/50 border-2 border-blue-500/30 rounded-lg ' +
                           'px-4 py-3 text-2xl text-center tracking-[0.2em] font-light ' +
                           'focus:outline-none focus:border-blue-400/60 transition-all ' +
                           'placeholder-blue-900 ' + (isAnimating ? 'bg-blue-500/10' : '')}
                  placeholder="●●●●●●"
                  disabled={isAnimating}
                />
                <div className="h-6">
                  {error && (
                    <div className="text-red-400 text-sm text-center animate-pulse">
                      {error?.message || String(error)}
                    </div>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-4">
                <button
                  onClick={handleJoin}
                  disabled={!gameCode.trim() || isAnimating}
                  className={'w-full py-3 px-6 rounded-lg relative overflow-hidden ' +
                           'transition-all duration-300 ' +
                           (!gameCode.trim() || isAnimating
                             ? 'bg-blue-900/20 text-blue-700 cursor-not-allowed'
                             : 'bg-blue-500/20 hover:bg-blue-400/30 text-blue-300')}
                >
                  <span className="relative z-10 tracking-[0.2em]">
                    {isAnimating ? 'CONNECTING...' : 'INITIALIZE JUMP'}
                  </span>
                  {/* Animated border */}
                  <div className={'absolute inset-px rounded-lg border-2 ' +
                                (isAnimating ? 'animate-pulse border-blue-400/60' 
                                           : 'border-blue-500/30')} />
                </button>

                <button
                  onClick={handleBack}
                  disabled={isAnimating}
                  className="w-full py-2 text-blue-500 hover:text-blue-400 
                           tracking-[0.2em] text-sm transition-colors"
                >
                  ← RETURN TO DOCK
                </button>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="absolute -bottom-24 left-1/2 transform -translate-x-1/2 w-full">
            <div className="text-center space-y-1">
              <div className="text-xs text-blue-700 tracking-[0.2em]">
                QUANTUM LINK: {isAnimating ? 'ACTIVE' : 'STANDBY'}
              </div>
              <div className="text-xs text-blue-800 tracking-[0.1em]">
                CORE TEMPERATURE: NOMINAL
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};