import { renderHook, act } from '@testing-library/react';
import { io } from 'socket.io-client';
import { useMultiplayerGame } from './useMultiplayerGame';
import { WebSocketEvents, IGameState } from '../../../shared/types';

// Мокаем socket.io-client
jest.mock('socket.io-client');

describe('useMultiplayerGame', () => {
  let mockSocket: any;
  let mockEmit: jest.Mock;
  let mockOn: jest.Mock;
  let mockOff: jest.Mock;

  beforeEach(() => {
    // Создаем моки для socket методов
    mockEmit = jest.fn();
    mockOn = jest.fn();
    mockOff = jest.fn();
    mockSocket = {
      emit: mockEmit,
      on: mockOn,
      off: mockOff,
      close: jest.fn(),
    };

    (io as jest.Mock).mockReturnValue(mockSocket);
  });

  afterEach(() => {
    jest.clearAllMocks();
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

    act(() => {
      result.current.createGame();
    });

    expect(mockEmit).toHaveBeenCalledWith(WebSocketEvents.CreateGame);
  });

  it('should join a game', () => {
    const { result } = renderHook(() => useMultiplayerGame());
    const testGameId = 'test-game-id';

    act(() => {
      result.current.joinGame(testGameId);
    });

    expect(mockEmit).toHaveBeenCalledWith(WebSocketEvents.JoinGame, { gameId: testGameId });
  });

  it('should make a move', () => {
    const { result } = renderHook(() => useMultiplayerGame());
    const testMove = { row: 0, col: 0 };

    // Симулируем создание игры
    act(() => {
      const gameCreatedCallback = mockOn.mock.calls.find(
        call => call[0] === WebSocketEvents.GameCreated
      )[1];
      gameCreatedCallback({ gameId: 'test-game-id' });
    });

    act(() => {
      result.current.makeMove(testMove);
    });

    expect(mockEmit).toHaveBeenCalledWith(WebSocketEvents.MakeMove, {
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

    act(() => {
      const updateCallback = mockOn.mock.calls.find(
        call => call[0] === WebSocketEvents.GameStateUpdated
      )[1];
      updateCallback({ gameState: testGameState, currentPlayer: 1 });
    });

    expect(result.current.gameState).toEqual(testGameState);
    expect(result.current.currentPlayer).toBe(1);
  });

  it('should handle errors', () => {
    const { result } = renderHook(() => useMultiplayerGame());
    const errorMessage = 'Test error message';

    act(() => {
      const errorCallback = mockOn.mock.calls.find(
        call => call[0] === WebSocketEvents.Error
      )[1];
      errorCallback({ message: errorMessage });
    });

    expect(result.current.error).toBe(errorMessage);
  });

  it('should handle player disconnection', () => {
    const { result } = renderHook(() => useMultiplayerGame());

    act(() => {
      const disconnectCallback = mockOn.mock.calls.find(
        call => call[0] === WebSocketEvents.PlayerDisconnected
      )[1];
      disconnectCallback({ player: 1 });
    });

    expect(result.current.error).toBe('Player 1 disconnected');
  });

  it('should handle game over', () => {
    const { result } = renderHook(() => useMultiplayerGame());
    const testGameState: IGameState = {
      board: [[0, 0, 0], [null, null, null], [null, null, null]],
      gameOver: true,
      winner: 0,
    };

    act(() => {
      const gameOverCallback = mockOn.mock.calls.find(
        call => call[0] === WebSocketEvents.GameOver
      )[1];
      gameOverCallback({ gameState: testGameState, winner: 0 });
    });

    expect(result.current.gameState).toEqual(testGameState);
    expect(result.current.error).toBe('Player 0 won!');
  });

  it('should clean up socket listeners on unmount', () => {
    const { unmount } = renderHook(() => useMultiplayerGame());

    unmount();

    expect(mockSocket.close).toHaveBeenCalled();
    const expectedEvents = [
      WebSocketEvents.GameCreated,
      WebSocketEvents.GameStarted,
      WebSocketEvents.GameStateUpdated,
      WebSocketEvents.GameOver,
      WebSocketEvents.Error,
      WebSocketEvents.PlayerDisconnected,
    ];

    expectedEvents.forEach(event => {
      expect(mockOff).toHaveBeenCalledWith(event);
    });
  });
});