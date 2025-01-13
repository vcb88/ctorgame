import { renderHook, act, waitFor } from '@testing-library/react';
import { io } from 'socket.io-client';
import { useMultiplayerGame } from './useMultiplayerGame';
import { 
  WebSocketEvents, 
  IGameState, 
  GameMove, 
  OperationType,
  BOARD_SIZE,
  MAX_PLACE_OPERATIONS
} from '@ctor-game/shared';
import { describe, it, expect, beforeEach, vi } from 'vitest';
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

  it('should make a placement move', async () => {
    const { result } = renderHook(() => useMultiplayerGame());
    const row = 0;
    const col = 0;

    // Симулируем создание игры
    await act(async () => {
      mockSocket.simulateEvent(WebSocketEvents.GameCreated, { gameId: 'test-game-id' });
    });

    // Ждем обновления состояния
    await waitFor(() => {
      expect(result.current.gameId).toBe('test-game-id');
    });

    await act(async () => {
      result.current.makeMove(row, col, OperationType.PLACE);
    });

    expect(mockSocket.mockEmit).toHaveBeenCalledWith(WebSocketEvents.MakeMove, {
      gameId: 'test-game-id',
      move: {
        type: OperationType.PLACE,
        position: { x: col, y: row }
      },
    });
  });

  it('should make a replace move', async () => {
    const { result } = renderHook(() => useMultiplayerGame());
    const row = 0;
    const col = 0;

    // Симулируем создание игры и ходы
    await act(async () => {
      mockSocket.simulateEvent(WebSocketEvents.GameCreated, { gameId: 'test-game-id' });
    });

    await waitFor(() => {
      expect(result.current.gameId).toBe('test-game-id');
    });

    await act(async () => {
      result.current.makeMove(row, col, OperationType.REPLACE);
    });

    expect(mockSocket.mockEmit).toHaveBeenCalledWith(WebSocketEvents.MakeMove, {
      gameId: 'test-game-id',
      move: {
        type: OperationType.REPLACE,
        position: { x: col, y: row }
      },
    });
  });

  it('should handle available replaces', async () => {
    const { result } = renderHook(() => useMultiplayerGame());
    const availableReplaces: GameMove[] = [
      {
        type: OperationType.REPLACE,
        position: { x: 0, y: 0 }
      }
    ];

    await act(async () => {
      mockSocket.simulateEvent(WebSocketEvents.AvailableReplaces, { moves: availableReplaces });
    });

    await waitFor(() => {
      expect(result.current.availableReplaces).toEqual(availableReplaces);
    });
  });

  it('should end turn', async () => {
    const { result } = renderHook(() => useMultiplayerGame());

    await act(async () => {
      mockSocket.simulateEvent(WebSocketEvents.GameCreated, { gameId: 'test-game-id' });
    });

    await waitFor(() => {
      expect(result.current.gameId).toBe('test-game-id');
    });

    await act(async () => {
      result.current.endTurn();
    });

    expect(mockSocket.mockEmit).toHaveBeenCalledWith(WebSocketEvents.EndTurn, {
      gameId: 'test-game-id'
    });
  });

  it('should handle game state updates', async () => {
    const { result } = renderHook(() => useMultiplayerGame());

    const testGameState: IGameState = {
      board: {
        cells: Array(10).fill(null).map(() => Array(10).fill(null)),
        size: { width: 10, height: 10 }
      },
      currentTurn: {
        placeOperationsLeft: 2,
        moves: []
      },
      scores: {
        player1: 0,
        player2: 0
      },
      gameOver: false,
      winner: null,
      isFirstTurn: true,
      currentPlayer: 0
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
      board: {
        cells: Array(10).fill(null).map((_, i) => i === 0 ? Array(10).fill(0) : Array(10).fill(null)),
        size: { width: 10, height: 10 }
      },
      currentTurn: {
        placeOperationsLeft: 2,
        moves: []
      },
      scores: {
        player1: 3,
        player2: 0
      },
      gameOver: true,
      winner: 0,
      isFirstTurn: false,
      currentPlayer: 0
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