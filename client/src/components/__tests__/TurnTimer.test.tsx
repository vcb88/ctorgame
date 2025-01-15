import React from 'react';
import { render, screen } from '@testing-library/react';
import { TurnTimer } from '../TurnTimer';

describe('TurnTimer', () => {
  const defaultProps = {
    duration: 30,
    isActive: true,
  };

  it('renders with default props', () => {
    render(<TurnTimer {...defaultProps} />);
    expect(screen.getByRole('timer')).toBeInTheDocument();
    expect(screen.getByText('30s')).toBeInTheDocument();
  });

  it('renders active state correctly', () => {
    render(<TurnTimer {...defaultProps} isActive={true} />);
    const progressbar = screen.getByRole('progressbar');
    const timer = screen.getByRole('timer');

    expect(progressbar).toHaveClass('text-cyan-500');
    expect(timer).toHaveClass('text-cyan-400');
  });

  it('renders inactive state correctly', () => {
    render(<TurnTimer {...defaultProps} isActive={false} />);
    const progressbar = screen.getByRole('progressbar');
    const timer = screen.getByRole('timer');

    expect(progressbar).toHaveClass('text-red-500');
    expect(timer).toHaveClass('text-red-400');
  });

  it('applies custom className correctly', () => {
    const customClass = 'test-class';
    render(<TurnTimer {...defaultProps} className={customClass} />);
    
    const container = screen.getByRole('timer').parentElement;
    expect(container).toHaveClass(customClass);
  });

  it('sets correct ARIA attributes', () => {
    render(<TurnTimer {...defaultProps} />);
    const progressbar = screen.getByRole('progressbar');
    
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '30');
    expect(progressbar).toHaveAttribute('aria-valuenow', '30');
  });

  it('updates ARIA values when inactive', () => {
    render(<TurnTimer {...defaultProps} isActive={false} />);
    const progressbar = screen.getByRole('progressbar');
    
    expect(progressbar).toHaveAttribute('aria-valuenow', '0');
  });
});