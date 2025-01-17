import React from 'react';
import { cn } from '@/lib/utils.js';

interface CyberButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  withTags?: boolean;
  glowing?: boolean;
}

export const CyberButton = React.forwardRef<HTMLButtonElement, CyberButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, withTags = false, glowing = false, ...props }, ref) => {
    const content = withTags ? (
      <>
        <span className="text-xs opacity-50">&lt;</span>
        {children}
        <span className="text-xs opacity-50">/&gt;</span>
      </>
    ) : children;

    return (
      <button
        className={cn(
          // Base styles
          "rounded-lg font-mono flex items-center justify-center gap-2",
          "transition-all duration-300 transform hover:-translate-y-0.5",
          
          // Size variants
          {
            "px-4 py-1 text-sm": size === 'sm',
            "px-8 py-2 text-base": size === 'md',
            "px-12 py-4 text-xl": size === 'lg',
          },
          
          // Variant styles
          {
            // Primary
            "bg-gradient-to-r from-cyan-500 to-blue-500 text-white border border-cyan-400": variant === 'primary',
            "hover:from-cyan-400 hover:to-blue-400": variant === 'primary',
            "shadow-[0_0_15px_rgba(34,211,238,0.5)] hover:shadow-[0_0_30px_rgba(34,211,238,0.8)]": variant === 'primary' && glowing,
            
            // Secondary
            "bg-transparent border border-cyan-500/30 text-cyan-400": variant === 'secondary',
            "hover:border-cyan-400 hover:bg-cyan-900/30 hover:text-cyan-300": variant === 'secondary',
            "shadow-[0_0_10px_rgba(34,211,238,0.2)] hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]": variant === 'secondary' && glowing,
            
            // Ghost
            "bg-transparent text-cyan-400 border-none": variant === 'ghost',
            "hover:text-cyan-300 hover:bg-cyan-900/20": variant === 'ghost',
            "shadow-none": variant === 'ghost'
          },
          
          className
        )}
        ref={ref}
        {...props}
      >
        {content}
      </button>
    );
  }
);

CyberButton.displayName = 'CyberButton';