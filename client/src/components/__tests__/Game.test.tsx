import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Game } from '../Game';
import { useMultiplayerGame } from '@/hooks/useMultiplayerGame';
import type { PlayerNumber } from '@ctor-game/shared/types/core.js';

// Mock the hook
vi.mock('@/hooks/useMultiplayerGame', () => ({
  useMultiplayerGame: vi.fn()
}));

describe('Game', () => {
  const mockUseMultiplayerGame = useMultiplayerGame as jest.Mock;

  beforeEach(() => {
    mockUseMultiplayerGame.mockReset();
  });

  it('renders login screen when no game id', () => {
    mockUseMultiplayerGame.mockReturnValue({
      gameId: null,
      playerNumber: null,
      gameState: null,
      error: null,
      isMyTurn: false,
      createGame: vi.fn(),
      joinGame: vi.fn(),
      makeMove: vi.fn(),
    });

    render(<Game />);
    expect(screen.getByText('Create New Game')).toBeInTheDocument();
    expect(screen.getByText('Join Game')).toBeInTheDocument();
  });

  it('renders waiting screen when waiting for opponent', () => {
    const testGameId = 'test-game-id';
    mockUseMultiplayerGame.mockReturnValue({
      gameId: testGameId,
      playerNumber: 1 as PlayerNumber,
      gameState: null,
      error: null,
      isMyTurn: false,
      createGame: vi.fn(),
      joinGame: vi.fn(),
      makeMove: vi.fn(),
    });

    render(<Game />);
    expect(screen.getByText('Waiting for opponent...')).toBeInTheDocument();
    expect(screen.getByText(testGameId)).toBeInTheDocument();
  });

  it('renders error screen when error occurs', () => {
    const testError = 'Test error message';
    mockUseMultiplayerGame.mockReturnValue({
      gameId: null,
      playerNumber: null,
      gameState: null,
      error: testError,
      isMyTurn: false,
      createGame: vi.fn(),
      joinGame: vi.fn(),
      makeMove: vi.fn(),
    });

    render(<Game />);
    expect(screen.getByText(testError)).toBeInTheDocument();
    expect(screen.getByText('Start New Game')).toBeInTheDocument();
  });

  // Add more tests as needed for MVP
});