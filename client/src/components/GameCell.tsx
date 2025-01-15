import React from 'react';
import { cn } from '@/lib/utils';
import { BOARD_SIZE } from '@ctor-game/shared/types/constants';
import { Player } from '@ctor-game/shared/types/game';
import { CellAnimationState, AnimationType } from '@/types/animations';

interface GameCellProps {
  row: number;
  col: number;
  value: Player | null;
  disabled: boolean;
  onClick?: () => void;
  isValidMove?: boolean;
  isHighlighted?: boolean;
  isLastMove?: boolean;
  currentPlayer?: Player;
  animationState?: CellAnimationState;
}

export const GameCell: React.FC<GameCellProps> = ({
  row,
  col,
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
          "animate-piece-placed": value !== null && animationType === AnimationType.PLACE,
          "animate-piece-capture": animationType === AnimationType.CAPTURE,
          "shadow-[0_0_15px_rgba(6,182,212,0.5)]": value === Player.First,
          "shadow-[0_0_15px_rgba(239,68,68,0.5)]": value === Player.Second,
          
          // Valid move indicator
          "after:absolute after:inset-0 after:border-2 after:border-dashed": isValidMove,
          "after:border-cyan-400/50": isValidMove && !disabled && (!currentPlayer || currentPlayer === Player.First),
          "after:border-red-400/50": (isValidMove && disabled) || (isValidMove && currentPlayer === Player.Second),
          "after:animate-pulse": isValidMove,
          
          // Highlight effects
          "ring-2 ring-yellow-400/50": isHighlighted,
          "ring-4 ring-green-400/50": isLastMove,
          
          // Animation effects
          "opacity-75": isAnimating,
          "scale-95": isAnimating && animationType === AnimationType.CAPTURE,
          "scale-105": isAnimating && animationType === AnimationType.PLACE,
          
          // Hover effects
          "hover:before:opacity-100": !disabled && !isAnimating,
          "hover:border-cyan-400/50": !disabled && !isAnimating && (!currentPlayer || currentPlayer === Player.First),
          "hover:border-red-400/50": (disabled && isValidMove) || (!disabled && !isAnimating && currentPlayer === Player.Second),
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
            "animate-piece-fade": isAnimating && animationType === AnimationType.CAPTURE,
            "animate-piece-appear": isAnimating && animationType === AnimationType.PLACE,
            "bg-cyan-500/20 text-cyan-400": value === Player.First,
            "bg-red-500/20 text-red-400": value === Player.Second,
          }
        )}>
          <div className={cn(
            "w-8 h-8 rounded-full",
            "transition-all duration-300",
            {
              "bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]": value === Player.First,
              "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]": value === Player.Second,
              "scale-0 opacity-0": isAnimating && animationType === AnimationType.CAPTURE,
              "scale-110": isAnimating && animationType === AnimationType.PLACE
            }
          )}></div>
          {/* Show previous piece during capture animation */}
          {isAnimating && animationType === AnimationType.CAPTURE && previousValue && (
            <div className={cn(
              "absolute w-8 h-8 rounded-full",
              "transition-all duration-300 animate-piece-capture",
              {
                "bg-cyan-500/50": previousValue === Player.First,
                "bg-red-500/50": previousValue === Player.Second
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