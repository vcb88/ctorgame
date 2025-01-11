import React from 'react';
import { cn } from '@/lib/utils';

interface TurnTimerProps {
  duration: number; // Duration in seconds
  isActive: boolean;
  className?: string;
}

export const TurnTimer: React.FC<TurnTimerProps> = ({
  duration,
  isActive,
  className
}) => {
  const circumference = 2 * Math.PI * 18; // radius = 18

  return (
    <div className={cn(
      "relative w-12 h-12 flex items-center justify-center",
      className
    )}>
      <svg
        className="transform -rotate-90 absolute inset-0"
        viewBox="0 0 40 40"
      >
        {/* Background circle */}
        <circle
          className="text-gray-700"
          strokeWidth="4"
          stroke="currentColor"
          fill="transparent"
          r="18"
          cx="20"
          cy="20"
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
          r="18"
          cx="20"
          cy="20"
          style={{
            '--timer-duration': `${duration}s`,
          } as React.CSSProperties}
        />
      </svg>
      {/* Timer text */}
      <span className={cn(
        "relative z-10 font-mono text-lg font-bold",
        {
          "text-cyan-400": isActive,
          "text-red-400": !isActive
        }
      )}>
        {duration}s
      </span>
    </div>
  );
};