import { render, screen, fireEvent } from '@testing-library/react';
import { GameOverScreen } from '../GameOverScreen';
import { PlayerNumber } from '@ctor-game/shared/src/types/core';

describe('GameOverScreen', () => {
  const mockOnReturnToMenu = vi.fn();
  const defaultScores: [number, number] = [3, 2];

  beforeEach(() => {
    mockOnReturnToMenu.mockClear();
  });

  it('should display winner message for player 1', () => {
    render(
      <GameOverScreen
        winner={1 as PlayerNumber}
        scores={defaultScores}
        onReturnToMenu={mockOnReturnToMenu}
      />
    );

    expect(screen.getByText(/First Player Wins!/i)).toBeInTheDocument();
    expect(screen.getByText(/Final Score: 3 pieces/i)).toBeInTheDocument();
  });

  it('should display winner message for player 2', () => {
    render(
      <GameOverScreen
        winner={2 as PlayerNumber}
        scores={defaultScores}
        onReturnToMenu={mockOnReturnToMenu}
      />
    );

    expect(screen.getByText(/Second Player Wins!/i)).toBeInTheDocument();
    expect(screen.getByText(/Final Score: 2 pieces/i)).toBeInTheDocument();
  });

  it('should display draw message when there is no winner', () => {
    render(
      <GameOverScreen
        winner={null}
        scores={defaultScores}
        onReturnToMenu={mockOnReturnToMenu}
      />
    );

    expect(screen.getByText(/It's a draw!/i)).toBeInTheDocument();
  });

  it('should call onReturnToMenu when button is clicked', () => {
    render(
      <GameOverScreen
        winner={1 as PlayerNumber}
        scores={defaultScores}
        onReturnToMenu={mockOnReturnToMenu}
      />
    );

    fireEvent.click(screen.getByText(/Return to Menu/i));
    expect(mockOnReturnToMenu).toHaveBeenCalledTimes(1);
  });
});