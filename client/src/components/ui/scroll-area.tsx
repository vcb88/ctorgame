import React from 'react';

interface ScrollAreaProps {
  children: React.ReactNode;
  className?: string;
  maxHeight?: string | number;
}

export function ScrollArea({ children, className = '', maxHeight }: ScrollAreaProps) {
  return (
    <div
      className={`overflow-auto ${className}`}
      style={{ maxHeight: maxHeight }}
    >
      {children}
    </div>
  );
}

ScrollArea.displayName = 'ScrollArea';