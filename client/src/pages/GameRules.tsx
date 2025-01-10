import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CyberTorusBackground } from '@/components/backgrounds/CyberTorusBackground';

export const GameRules: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen text-cyan-50 overflow-auto">
      <CyberTorusBackground />
      
      {/* Content overlay */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        <button
          onClick={() => navigate('/')}
          className="mb-8 text-cyan-400 hover:text-cyan-300 
                   transition-colors duration-300 
                   font-mono flex items-center gap-2"
        >
          <span className="text-xs">&lt;</span>
          BACK TO MENU
          <span className="text-xs">/&gt;</span>
        </button>

        <div className="bg-black/30 backdrop-blur-sm p-8 rounded-lg border border-cyan-900/50">
          <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            Game Rules
          </h1>

          <div className="space-y-8">
            {/* Game Overview */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-cyan-400">Game Overview</h2>
              <p className="text-cyan-100 leading-relaxed">
                CTOR Game is a strategic board game where two players compete to capture
                territory on a toroidal surface. The game combines elements of Go and
                Chess, creating a unique experience of territorial control in a
                wrap-around space.
              </p>
            </section>

            {/* Game Board */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-cyan-400">Game Board</h2>
              <div className="text-cyan-100 space-y-2">
                <p>
                  The game is played on a 10x10 grid that wraps around both horizontally
                  and vertically, forming a torus surface.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Moving off the right edge continues on the left</li>
                  <li>Moving off the bottom continues from the top</li>
                  <li>Diagonal movements and captures wrap around as well</li>
                </ul>
              </div>
            </section>

            {/* Game Flow */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-cyan-400">Game Flow</h2>
              <div className="text-cyan-100 space-y-2">
                <p className="font-bold">Each turn consists of:</p>
                <ul className="list-decimal list-inside space-y-1 ml-4">
                  <li>Place up to 2 pieces on empty cells (1 on first turn)</li>
                  <li>Check for captures after each placement</li>
                  <li>Score is updated based on captured territory</li>
                </ul>
              </div>
            </section>

            {/* Capturing */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-cyan-400">Capturing Rules</h2>
              <div className="text-cyan-100 space-y-2">
                <p>
                  Pieces are captured when surrounded by the opponent's pieces.
                  Surrounding can happen in several ways:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Orthogonally (horizontally or vertically)</li>
                  <li>Diagonally</li>
                  <li>Through wrap-around connections</li>
                </ul>
                <p className="mt-4">
                  Multiple pieces can be captured in a single move if they become
                  surrounded simultaneously.
                </p>
              </div>
            </section>

            {/* Winning */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-cyan-400">Winning the Game</h2>
              <div className="text-cyan-100 space-y-2">
                <p>The game ends when either:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>One player captures more than 50% of the board</li>
                  <li>The board is filled and no more moves are possible</li>
                </ul>
                <p className="mt-4">
                  The player with the most territory at the end wins the game.
                </p>
              </div>
            </section>

            {/* Tips */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-cyan-400">Strategic Tips</h2>
              <div className="text-cyan-100 space-y-2">
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Consider the wrap-around nature when planning moves</li>
                  <li>Watch for capture opportunities on both sides of the board</li>
                  <li>Balance between offensive placement and defensive positioning</li>
                  <li>Use the edges of the board strategically - they connect!</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};