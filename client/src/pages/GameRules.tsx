import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CyberRulesBackground } from '@/components/backgrounds/CyberRulesBackground';

export const GameRules: React.FC = () => {
  const navigate = useNavigate();
  const [glitchText, setGlitchText] = useState(false);

  // Glitch effect animation
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchText(true);
      setTimeout(() => setGlitchText(false), 150);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen text-cyan-50 overflow-auto">
      <CyberRulesBackground />
      
      {/* Content overlay */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        <button
          onClick={() => navigate('/')}
          className="mb-8 text-red-500 hover:text-red-400 
                   transition-all duration-300 
                   font-mono flex items-center gap-2
                   border border-red-500/30 px-4 py-2 rounded
                   hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]"
        >
          <span className="text-xs">[</span>
          RETURN TO MAINFRAME
          <span className="text-xs">]</span>
        </button>

        <div className="bg-black/40 backdrop-blur-md p-8 rounded-lg 
                      border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)]
                      transform perspective-1000 rotate-x-1
                      hover:shadow-[0_0_40px_rgba(6,182,212,0.25)]
                      transition-all duration-500">
          <h1 className={`relative text-4xl font-bold mb-8 text-transparent bg-clip-text 
                     bg-gradient-to-r from-cyan-400 via-blue-500 to-red-500
                     ${glitchText ? 'after:content-[attr(data-text)] after:absolute after:left-[2px] after:top-0 after:w-full after:h-full after:text-red-500' : ''}`}
              data-text="Game Rules">
            Game Rules
          </h1>

          <div className="space-y-12 relative">
            {/* Game Overview */}
            <section className="transform hover:translate-x-1 transition-transform duration-300">
              <h2 className="text-2xl font-bold mb-4 text-red-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                Game Overview
              </h2>
              <p className="text-cyan-100 leading-relaxed backdrop-blur-sm bg-black/20 p-4 rounded-lg border-l-2 border-red-500/30">
                CTOR Game is a strategic board game where two players compete to capture
                territory on a toroidal surface. The game combines elements of Go and
                Chess, creating a unique experience of territorial control in a
                wrap-around space.
              </p>
            </section>

            {/* Game Board */}
            <section className="transform hover:-translate-x-1 transition-transform duration-300">
              <h2 className="text-2xl font-bold mb-4 text-cyan-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                Game Board
              </h2>
              <div className="text-cyan-100 space-y-2 backdrop-blur-sm bg-black/20 p-4 rounded-lg border-l-2 border-cyan-500/30">
                <p>
                  The game is played on a 10x10 grid that wraps around both horizontally
                  and vertically, forming a torus surface.
                </p>
                <ul className="list-none space-y-1 ml-4">
                  {[
                    'Moving off the right edge continues on the left',
                    'Moving off the bottom continues from the top',
                    'Diagonal movements and captures wrap around as well'
                  ].map((text, index) => (
                    <li key={index} className="flex items-center gap-2 before:content-[''] before:w-1 before:h-1 before:bg-cyan-400 before:rounded-full">
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Game Flow */}
            <section className="transform hover:translate-x-1 transition-transform duration-300">
              <h2 className="text-2xl font-bold mb-4 text-yellow-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                Game Flow
              </h2>
              <div className="text-cyan-100 space-y-2 backdrop-blur-sm bg-black/20 p-4 rounded-lg border-l-2 border-yellow-500/30">
                <p className="font-bold text-yellow-200">Each turn consists of:</p>
                <ul className="space-y-3 ml-4">
                  {[
                    'Place up to 2 pieces on empty cells (1 on first turn)',
                    'Check for captures after each placement',
                    'Score is updated based on captured territory'
                  ].map((text, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-yellow-400 font-mono">{index + 1}.</span>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Capturing */}
            <section className="transform hover:-translate-x-1 transition-transform duration-300">
              <h2 className="text-2xl font-bold mb-4 text-blue-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                Capturing Rules
              </h2>
              <div className="text-cyan-100 space-y-2 backdrop-blur-sm bg-black/20 p-4 rounded-lg border-l-2 border-blue-500/30">
                <p>
                  Pieces are captured when surrounded by the opponent's pieces.
                  Surrounding can happen in several ways:
                </p>
                <ul className="list-none space-y-1 ml-4">
                  {[
                    'Orthogonally (horizontally or vertically)',
                    'Diagonally',
                    'Through wrap-around connections'
                  ].map((text, index) => (
                    <li key={index} className="flex items-center gap-2 before:content-[''] before:w-1 before:h-1 before:bg-blue-400 before:rounded-full">
                      {text}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 border-t border-blue-500/30 pt-4">
                  Multiple pieces can be captured in a single move if they become
                  surrounded simultaneously.
                </p>
              </div>
            </section>

            {/* Winning */}
            <section className="transform hover:translate-x-1 transition-transform duration-300">
              <h2 className="text-2xl font-bold mb-4 text-purple-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                Winning the Game
              </h2>
              <div className="text-cyan-100 space-y-2 backdrop-blur-sm bg-black/20 p-4 rounded-lg border-l-2 border-purple-500/30">
                <p>The game ends when either:</p>
                <ul className="list-none space-y-1 ml-4">
                  {[
                    'One player captures more than 50% of the board',
                    'The board is filled and no more moves are possible'
                  ].map((text, index) => (
                    <li key={index} className="flex items-center gap-2 before:content-[''] before:w-1 before:h-1 before:bg-purple-400 before:rounded-full">
                      {text}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 border-t border-purple-500/30 pt-4">
                  The player with the most territory at the end wins the game.
                </p>
              </div>
            </section>

            {/* Tips */}
            <section className="transform hover:-translate-x-1 transition-transform duration-300">
              <h2 className="text-2xl font-bold mb-4 text-green-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                Strategic Tips
              </h2>
              <div className="text-cyan-100 space-y-2 backdrop-blur-sm bg-black/20 p-4 rounded-lg border-l-2 border-green-500/30">
                <ul className="list-none space-y-1 ml-4">
                  {[
                    'Consider the wrap-around nature when planning moves',
                    'Watch for capture opportunities on both sides of the board',
                    'Balance between offensive placement and defensive positioning',
                    'Use the edges of the board strategically - they connect!'
                  ].map((text, index) => (
                    <li key={index} className="flex items-center gap-2 before:content-[''] before:w-1 before:h-1 before:bg-green-400 before:rounded-full">
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};