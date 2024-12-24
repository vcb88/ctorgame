import { renderHook, act, waitFor } from '@testing-library/react';
import { io } from 'socket.io-client';
import { useMultiplayerGame } from './useMultiplayerGame';
import { WebSocketEvents, IGameState } from '@ctor-game/shared/types';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createMockSocket } from '../test/test-utils';

vi.mock('socket.io-client', () => ({
  io: vi.fn()
}));

describe('useMultiplayerGame', () => {
  const mockSocket = createMockSocket();

  beforeEach(() => {
    vi.clearAllMocks();
    (io as ReturnType<typeof vi.fn>).mockReturnValue(mockSocket);
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useMultiplayerGame());

    expect(result.current.gameId).toBeNull();
    expect(result.current.playerNumber).toBeNull();
    expect(result.current.gameState).toBeNull();
    expect(result.current.currentPlayer).toBe(0);
    expect(result.current.error).toBeNull();
    expect(result.current.isMyTurn).toBe(false);
  });

  it('should create a game', () => {
    const { result } = renderHook(() => useMultiplayerGame());

    result.current.createGame();

    expect(mockSocket.mockEmit).toHaveBeenCalledWith(WebSocketEvents.CreateGame);
  });

  it('should join a game', () => {
    const { result } = renderHook(() => useMultiplayerGame());
    const testGameId = 'test-game-id';

    result.current.joinGame(testGameId);

    expect(mockSocket.mockEmit).toHaveBeenCalledWith(WebSocketEvents.JoinGame, { gameId: testGameId });
  });

  it('should make a move', async () => {
    const { result } = renderHook(() => useMultiplayerGame());
    const testMove = { row: 0, col: 0 };

    // Симулируем создание игры
    await act(async () => {
      mockSocket.simulateEvent(WebSocketEvents.GameCreated, { gameId: 'test-game-id' });
    });

    // Ждем обновления состояния
    await waitFor(() => {
      expect(result.current.gameId).toBe('test-game-id');
    });

    await act(async () => {
      result.current.makeMove(testMove);
    });

    expect(mockSocket.mockEmit).toHaveBeenCalledWith(WebSocketEvents.MakeMove, {
      gameId: 'test-game-id',
      move: testMove,
    });
  });

  it('should handle game state updates', async () => {
    const { result } = renderHook(() => useMultiplayerGame());

    const testGameState: IGameState = {
      board: [[null, null, null], [null, null, null], [null, null, null]],
      gameOver: false,
      winner: null,
    };

    await act(async () => {
      mockSocket.simulateEvent(WebSocketEvents.GameStateUpdated, { 
        gameState: testGameState, 
        currentPlayer: 1 
      });
    });

    await waitFor(() => {
      expect(result.current.gameState).toEqual(testGameState);
      expect(result.current.currentPlayer).toBe(1);
    });
  });

  it('should handle errors', async () => {
    const { result } = renderHook(() => useMultiplayerGame());
    const errorMessage = 'Test error message';

    await act(async () => {
      mockSocket.simulateEvent(WebSocketEvents.Error, { message: errorMessage });
    });

    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
    });
  });

  it('should handle player disconnection', async () => {
    const { result } = renderHook(() => useMultiplayerGame());

    await act(async () => {
      mockSocket.simulateEvent(WebSocketEvents.PlayerDisconnected, { player: 1 });
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Player 1 disconnected');
    });
  });

  it('should handle game over', async () => {
    const { result } = renderHook(() => useMultiplayerGame());
    const testGameState: IGameState = {
      board: [[0, 0, 0], [null, null, null], [null, null, null]],
      gameOver: true,
      winner: 0,
    };

    await act(async () => {
      mockSocket.simulateEvent(WebSocketEvents.GameOver, { 
        gameState: testGameState, 
        winner: 0 
      });
    });

    await waitFor(() => {
      expect(result.current.gameState).toEqual(testGameState);
      expect(result.current.error).toBe('Player 0 won!');
    });
  });

  it('should clean up socket listeners on unmount', () => {
    const { unmount } = renderHook(() => useMultiplayerGame());

    unmount();

    expect(mockSocket.mockClose).toHaveBeenCalled();
    const expectedEvents = [
      WebSocketEvents.GameCreated,
      WebSocketEvents.GameStarted,
      WebSocketEvents.GameStateUpdated,
      WebSocketEvents.GameOver,
      WebSocketEvents.Error,
      WebSocketEvents.PlayerDisconnected,
    ];

    expectedEvents.forEach(event => {
      expect(mockSocket.mockOff).toHaveBeenCalledWith(event);
    });
  });
});