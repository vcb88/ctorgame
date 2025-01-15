import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { GameCell } from '../GameCell';
import type { Position, PlayerNumber } from '@ctor-game/shared/src/types/core.js';

describe('GameCell', () => {
  const defaultPosition: Position = [0, 0];
  const mockOnClick = vi.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('renders empty cell correctly', () => {
    const { container } = render(
      <GameCell
        position={defaultPosition}
        value={null}
        disabled={false}
        onClick={mockOnClick}
      />
    );
    
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders player 1 cell correctly', () => {
    const { container } = render(
      <GameCell
        position={defaultPosition}
        value={1 as PlayerNumber}
        disabled={false}
        onClick={mockOnClick}
      />
    );
    
    // Should have cyan color classes
    expect(container.firstChild).toHaveClass('shadow-[0_0_15px_rgba(6,182,212,0.5)]');
  });

  it('renders player 2 cell correctly', () => {
    const { container } = render(
      <GameCell
        position={defaultPosition}
        value={2 as PlayerNumber}
        disabled={false}
        onClick={mockOnClick}
      />
    );
    
    // Should have red color classes
    expect(container.firstChild).toHaveClass('shadow-[0_0_15px_rgba(239,68,68,0.5)]');
  });

  it('handles click events when not disabled', () => {
    const { container } = render(
      <GameCell
        position={defaultPosition}
        value={null}
        disabled={false}
        onClick={mockOnClick}
      />
    );
    
    fireEvent.click(container.firstChild!);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('does not handle click events when disabled', () => {
    const { container } = render(
      <GameCell
        position={defaultPosition}
        value={null}
        disabled={true}
        onClick={mockOnClick}
      />
    );
    
    fireEvent.click(container.firstChild!);
    expect(mockOnClick).not.toHaveBeenCalled();
    expect(container.firstChild).toHaveClass('cursor-not-allowed');
  });
});