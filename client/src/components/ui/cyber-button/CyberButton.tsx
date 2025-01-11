import React from 'react';
import clsx from 'clsx';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface CyberButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  glowing?: boolean;
  withTags?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary: 'bg-cyan-500 hover:bg-cyan-400 text-black border-cyan-300',
  secondary: 'bg-blue-600 hover:bg-blue-500 text-white border-blue-400',
  ghost: 'bg-transparent hover:bg-cyan-900/30 text-cyan-500 border-cyan-700'
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg'
};

const glowColors: Record<Variant, string> = {
  primary: 'shadow-cyan-500/50',
  secondary: 'shadow-blue-500/50',
  ghost: 'shadow-cyan-700/30'
};

export const CyberButton: React.FC<CyberButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  glowing = false,
  withTags = false,
  className,
  ...props
}) => {
  const baseStyles = 'relative font-mono transition-all duration-200 border-2';
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];
  const glowStyle = glowing ? `shadow-lg ${glowColors[variant]}` : '';

  return (
    <button
      className={clsx(
        baseStyles,
        variantStyle,
        sizeStyle,
        glowStyle,
        className
      )}
      {...props}
    >
      {withTags && (
        <span className="absolute left-0 -ml-2 text-cyan-500 opacity-75">&lt;</span>
      )}
      {children}
      {withTags && (
        <span className="absolute right-0 -mr-2 text-cyan-500 opacity-75">/&gt;</span>
      )}
    </button>
  );
};