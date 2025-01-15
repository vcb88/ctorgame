import React from 'react';
import { cn } from '@/lib/utils';
import { BOARD_SIZE } from '@ctor-game/shared/src/types/core.js';
import type { PlayerNumber, Position } from '@ctor-game/shared/src/types/core.js';
import type { CellAnimationState } from '@/types/animations';

type GameCellProps = {
  position: Position;
  value: PlayerNumber | null;
  disabled: boolean;
  onClick?: () => void;
  isValidMove?: boolean;
  isHighlighted?: boolean;
  isLastMove?: boolean;
  currentPlayer?: PlayerNumber;
  animationState?: CellAnimationState;
};

export const GameCell: React.FC<GameCellProps> = ({
  position: [row, col],
  value,
  disabled,
  onClick,
  isValidMove = false,
  isHighlighted = false,
  isLastMove = false,
  currentPlayer,
  animationState
}) => {
  const isAnimating = animationState?.isAnimating;
  const animationType = animationState?.type;
  const previousValue = animationState?.data?.previousValue;
  return (
    <div
      onClick={onClick}
      className={cn(
        "w-12 h-12 flex items-center justify-center text-2xl font-bold relative",
        "cursor-pointer transition-all duration-300",
        "border border-cyan-500/30 bg-black/80",
        "before:absolute before:inset-0 before:opacity-0",
        "before:transition-opacity before:duration-300",
        {
          // Base piece effects
          "animate-piece-placed": value !== null && animationType === 'place',
          "animate-piece-capture": animationType === 'capture',
          "shadow-[0_0_15px_rgba(6,182,212,0.5)]": value === 1,
          "shadow-[0_0_15px_rgba(239,68,68,0.5)]": value === 2,
          
          // Valid move indicator
          "after:absolute after:inset-0 after:border-2 after:border-dashed": isValidMove,
          "after:border-cyan-400/50": isValidMove && !disabled && (!currentPlayer || currentPlayer === 1),
          "after:border-red-400/50": (isValidMove && disabled) || (isValidMove && currentPlayer === 2),
          "after:animate-pulse": isValidMove,
          
          // Highlight effects
          "ring-2 ring-yellow-400/50": isHighlighted,
          "ring-4 ring-green-400/50": isLastMove,
          
          // Animation effects
          "opacity-75": isAnimating,
          "scale-95": isAnimating && animationType === 'capture',
          "scale-105": isAnimating && animationType === 'place',
          
          // Hover effects
          "hover:before:opacity-100": !disabled && !isAnimating,
          "hover:border-cyan-400/50": !disabled && !isAnimating && (!currentPlayer || currentPlayer === 1),
          "hover:border-red-400/50": (disabled && isValidMove) || (!disabled && !isAnimating && currentPlayer === 2),
          "cursor-not-allowed": disabled || isAnimating
        }
      )}
    >
      {/* Cell content with glow effect */}
      {value !== null && (
        <div className={cn(
          "absolute inset-0 flex items-center justify-center",
          "transition-all duration-300",
          {
            "animate-piece-glow": !isAnimating,
            "animate-piece-fade": isAnimating && animationType === 'capture',
            "animate-piece-appear": isAnimating && animationType === 'place',
            "bg-cyan-500/20 text-cyan-400": value === 1,
            "bg-red-500/20 text-red-400": value === 2,
          }
        )}>
          <div className={cn(
            "w-8 h-8 rounded-full",
            "transition-all duration-300",
            {
              "bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]": value === 1,
              "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]": value === 2,
              "scale-0 opacity-0": isAnimating && animationType === 'capture',
              "scale-110": isAnimating && animationType === 'place'
            }
          )}></div>
          {/* Show previous piece during capture animation */}
          {isAnimating && animationType === 'capture' && previousValue && (
            <div className={cn(
              "absolute w-8 h-8 rounded-full",
              "transition-all duration-300 animate-piece-capture",
              {
                "bg-cyan-500/50": previousValue === 1,
                "bg-red-500/50": previousValue === 2
              }
            )}></div>
          )}
        </div>
      )}

      {/* Toroidal borders */}
      <div className={cn(
        "absolute inset-0 pointer-events-none",
        {
          "before:absolute before:left-0 before:right-0 before:h-0.5 before:bg-cyan-400/50 before:shadow-[0_0_5px_rgba(6,182,212,0.5)] before:top-0": row === 0,
          "after:absolute after:left-0 after:right-0 after:h-0.5 after:bg-cyan-400/50 after:shadow-[0_0_5px_rgba(6,182,212,0.5)] after:bottom-0": row === BOARD_SIZE - 1,
          "before:absolute before:top-0 before:bottom-0 before:w-0.5 before:bg-cyan-400/50 before:shadow-[0_0_5px_rgba(6,182,212,0.5)] before:left-0": col === 0,
          "after:absolute after:top-0 after:bottom-0 after:w-0.5 after:bg-cyan-400/50 after:shadow-[0_0_5px_rgba(6,182,212,0.5)] after:right-0": col === BOARD_SIZE - 1
        }
      )}></div>

      {/* Toroidal connection points with TRON style */}
      {row === 0 && (
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-cyan-400 shadow-[0_0_5px_rgba(6,182,212,0.8)] rounded-full"></div>
      )}
      {row === BOARD_SIZE - 1 && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-cyan-400 shadow-[0_0_5px_rgba(6,182,212,0.8)] rounded-full"></div>
      )}
      {col === 0 && (
        <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1 h-1 bg-cyan-400 shadow-[0_0_5px_rgba(6,182,212,0.8)] rounded-full"></div>
      )}
      {col === BOARD_SIZE - 1 && (
        <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-1 bg-cyan-400 shadow-[0_0_5px_rgba(6,182,212,0.8)] rounded-full"></div>
      )}
    </div>
  );
};