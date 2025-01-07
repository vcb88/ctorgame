import React, { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:opacity-50';
    
    const variantStyles = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
    };

    const sizeStyles = {
      default: 'h-10 px-4 py-2',
      sm: 'h-8 px-3 text-sm',
      lg: 'h-12 px-8',
    };

    const Comp = asChild ? React.Children.only(children)?.type : 'button';
    const childProps = asChild ? React.Children.only(children)?.props : {};

    return (
      <Comp
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        ref={ref}
        {...childProps}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';