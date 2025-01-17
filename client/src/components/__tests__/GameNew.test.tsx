import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameNew } from '../GameNew';
import { useMultiplayerGameNew } from '@/hooks/useMultiplayerGameNew.v2';
import type { PlayerNumber } from '@ctor-game/shared/types/core.js';

// Mock the hook
vi.mock('@/hooks/useMultiplayerGameNew.v2', () => ({
  useMultiplayerGameNew: vi.fn()
}));

describe('GameNew', () => {
  const mockUseMultiplayerGameNew = useMultiplayerGameNew as jest.Mock;

  beforeEach(() => {
    mockUseMultiplayerGameNew.mockReset();
  });

  it('renders login screen when no game id', () => {
    mockUseMultiplayerGameNew.mockReturnValue({
      gameId: null,
      playerNumber: null,
      gameState: null,
      error: null,
      loading: false,
      operationInProgress: null,
      isMyTurn: false,
      createGame: vi.fn(),
      joinGame: vi.fn(),
      makeMove: vi.fn(),
      canRetry: false,
      canRecover: false
    });

    render(<GameNew />);
    expect(screen.getByText('Create New Game')).toBeInTheDocument();
    expect(screen.getByText('Join Game')).toBeInTheDocument();
  });

  it('shows loading states during operations', () => {
    mockUseMultiplayerGameNew.mockReturnValue({
      gameId: null,
      playerNumber: null,
      gameState: null,
      error: null,
      loading: true,
      operationInProgress: 'CREATE_GAME',
      isMyTurn: false,
      createGame: vi.fn(),
      joinGame: vi.fn(),
      makeMove: vi.fn(),
      canRetry: false,
      canRecover: false
    });

    render(<GameNew />);
    expect(screen.getByText('Creating...')).toBeInTheDocument();
  });

  it('renders waiting screen when waiting for opponent', () => {
    const testGameId = 'test-game-id';
    mockUseMultiplayerGameNew.mockReturnValue({
      gameId: testGameId,
      playerNumber: 1 as PlayerNumber,
      gameState: null,
      error: null,
      loading: false,
      operationInProgress: null,
      isMyTurn: false,
      createGame: vi.fn(),
      joinGame: vi.fn(),
      makeMove: vi.fn(),
      canRetry: false,
      canRecover: false
    });

    render(<GameNew />);
    expect(screen.getByText('Waiting for opponent...')).toBeInTheDocument();
    expect(screen.getByText(testGameId)).toBeInTheDocument();
  });

  it('renders error screen with retry option when available', () => {
    const testError = { message: 'Test error message' };
    mockUseMultiplayerGameNew.mockReturnValue({
      gameId: null,
      playerNumber: null,
      gameState: null,
      error: testError,
      loading: false,
      operationInProgress: null,
      isMyTurn: false,
      createGame: vi.fn(),
      joinGame: vi.fn(),
      makeMove: vi.fn(),
      canRetry: true,
      canRecover: false
    });

    render(<GameNew />);
    expect(screen.getByText(testError.message)).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });
});