import { renderHook } from '@testing-library/react';
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

  it('should make a move', () => {
    const { result } = renderHook(() => useMultiplayerGame());
    const testMove = { row: 0, col: 0 };

    // Симулируем создание игры
    const gameCreatedCallback = mockSocket.mockOn.mock.calls.find(
      call => call[0] === WebSocketEvents.GameCreated
    )?.[1];
    
    if (gameCreatedCallback) {
      gameCreatedCallback({ gameId: 'test-game-id' });
    }

    result.current.makeMove(testMove);

    expect(mockSocket.mockEmit).toHaveBeenCalledWith(WebSocketEvents.MakeMove, {
      gameId: 'test-game-id',
      move: testMove,
    });
  });

  it('should handle game state updates', () => {
    const { result } = renderHook(() => useMultiplayerGame());

    const testGameState: IGameState = {
      board: [[null, null, null], [null, null, null], [null, null, null]],
      gameOver: false,
      winner: null,
    };

    const updateCallback = mockSocket.mockOn.mock.calls.find(
      call => call[0] === WebSocketEvents.GameStateUpdated
    )?.[1];
    
    if (updateCallback) {
      updateCallback({ gameState: testGameState, currentPlayer: 1 });
    }

    expect(result.current.gameState).toEqual(testGameState);
    expect(result.current.currentPlayer).toBe(1);
  });

  it('should handle errors', () => {
    const { result } = renderHook(() => useMultiplayerGame());
    const errorMessage = 'Test error message';

    const errorCallback = mockSocket.mockOn.mock.calls.find(
      call => call[0] === WebSocketEvents.Error
    )?.[1];
    
    if (errorCallback) {
      errorCallback({ message: errorMessage });
    }

    expect(result.current.error).toBe(errorMessage);
  });

  it('should handle player disconnection', () => {
    const { result } = renderHook(() => useMultiplayerGame());

    const disconnectCallback = mockSocket.mockOn.mock.calls.find(
      call => call[0] === WebSocketEvents.PlayerDisconnected
    )?.[1];
    
    if (disconnectCallback) {
      disconnectCallback({ player: 1 });
    }

    expect(result.current.error).toBe('Player 1 disconnected');
  });

  it('should handle game over', () => {
    const { result } = renderHook(() => useMultiplayerGame());
    const testGameState: IGameState = {
      board: [[0, 0, 0], [null, null, null], [null, null, null]],
      gameOver: true,
      winner: 0,
    };

    const gameOverCallback = mockSocket.mockOn.mock.calls.find(
      call => call[0] === WebSocketEvents.GameOver
    )?.[1];
    
    if (gameOverCallback) {
      gameOverCallback({ gameState: testGameState, winner: 0 });
    }

    expect(result.current.gameState).toEqual(testGameState);
    expect(result.current.error).toBe('Player 0 won!');
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