import React from 'react';
import { cn } from '@/lib/utils.js';
import type { Timestamp } from '@ctor-game/shared/types/core.js';

// Custom CSS properties type
type TimerStyle = {
  '--timer-duration': string;
};

interface TurnTimerProps {
  duration: Timestamp; // Duration in seconds
  isActive: boolean;
  className?: string;
}

export const TurnTimer: React.FC<TurnTimerProps> = ({
  duration,
  isActive,
  className
}) => {
  // Constants
  const RADIUS = 18;
  const circumference = 2 * Math.PI * RADIUS;
  
  // CSS variables
  const timerStyle: TimerStyle = {
    '--timer-duration': `${duration}s`,
  };

  return (
    <div className={cn(
      "relative w-12 h-12 flex items-center justify-center",
      className
    )}>
      <svg
        className="transform -rotate-90 absolute inset-0"
        viewBox="0 0 40 40"
        aria-label={`Timer for ${duration} seconds`}
      >
        {/* Background circle */}
        <circle
          className="text-gray-700"
          strokeWidth="4"
          stroke="currentColor"
          fill="transparent"
          r={RADIUS}
          cx="20"
          cy="20"
          aria-hidden="true"
        />
        {/* Timer circle */}
        <circle
          className={cn(
            "animate-piece-timer",
            "transition-all duration-300",
            {
              "text-cyan-500": isActive,
              "text-red-500": !isActive,
              "animate-none": !isActive
            }
          )}
          strokeWidth="4"
          strokeDasharray={circumference}
          stroke="currentColor"
          fill="transparent"
          r={RADIUS}
          cx="20"
          cy="20"
          style={timerStyle}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-valuenow={isActive ? duration : 0}
        />
      </svg>
      {/* Timer text */}
      <span className={cn(
        "relative z-10 font-mono text-lg font-bold",
        {
          "text-cyan-400": isActive,
          "text-red-400": !isActive
        }
      )}
        role="timer"
        aria-live="polite"
      >
        {duration}s
      </span>
    </div>
  );
};