import React from 'react';
import { cn } from '@/lib/utils';
import type { Player } from '@ctor-game/shared/types/base/enums';

interface GameOverScreenProps {
  winner: Player | null;
  scores: {
    [Player.First]: number;
    [Player.Second]: number;
  };
  onReturnToMenu: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  winner,
  scores,
  onReturnToMenu
}) => {
  return (
    <div className={cn(
      "fixed inset-0 z-50",
      "bg-gradient-to-br from-purple-900/90 via-fuchsia-900/90 to-pink-900/90",
      "backdrop-blur-lg",
      "animate-fade-in"
    )}>
      <div className={cn(
        "absolute inset-0",
        "overflow-hidden",
        "pointer-events-none"
      )}>
        {/* Geometric particles background */}
        <div className="particles-container">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "absolute",
                "w-8 h-8 md:w-12 md:h-12",
                "rounded-full",
                "animate-float",
                "opacity-30",
                "bg-gradient-to-r",
                {
                  "from-cyan-400 to-blue-500": i % 3 === 0,
                  "from-fuchsia-400 to-pink-500": i % 3 === 1,
                  "from-purple-400 to-indigo-500": i % 3 === 2,
                }
              )}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${4 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className={cn(
        "relative z-10",
        "flex flex-col items-center justify-center",
        "min-h-screen",
        "p-4",
        "text-white",
        "animate-content-appear"
      )}>
        <h1 className={cn(
          "text-6xl md:text-8xl font-bold",
          "text-transparent bg-clip-text",
          "bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-purple-500",
          "animate-gradient-x",
          "mb-8"
        )}>
          Game Over
        </h1>

        <div className={cn(
          "text-3xl md:text-4xl",
          "font-light",
          "mb-12",
          "text-center",
          "animate-slide-up",
          "delay-300"
        )}>
          {winner === null ? (
            <span className="text-gray-200">It's a draw!</span>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-lg",
                  "animate-winner-glow",
                  {
                    "bg-cyan-500": winner === Player.First,
                    "bg-red-500": winner === Player.Second
                  }
                )} />
                <span>
                  {winner === Player.First ? 'First' : 'Second'} Player Wins!
                </span>
              </div>
              <div className="text-xl font-mono mt-4 opacity-80">
                Final Score: {scores[winner]} pieces
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-6">
          <button
            onClick={onReturnToMenu}
            className={cn(
              "px-8 py-4",
              "rounded-lg",
              "text-xl",
              "font-medium",
              "transition-all duration-300",
              "bg-gradient-to-r from-cyan-500 to-blue-500",
              "hover:from-cyan-400 hover:to-blue-400",
              "animate-slide-up",
              "delay-500",
              "shadow-lg shadow-cyan-500/20",
              "hover:shadow-xl hover:shadow-cyan-500/30",
              "transform hover:-translate-y-1"
            )}
          >
            Return to Menu
          </button>
        </div>
      </div>
    </div>
  );
};