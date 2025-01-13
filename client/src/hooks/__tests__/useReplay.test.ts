import { renderHook, act } from '@testing-library/react-hooks';
import { useReplay } from '@/hooks/useReplay';
import { Socket } from 'socket.io-client';
import { ReplayEvent } from '@ctor-game/shared/types/network';
import { IGameState } from '@ctor-game/shared/types/game';

import { vi } from 'vitest';

// Мок для Socket.io
const mockSocket = {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
} as unknown as Socket;

// Мок для начального состояния игры
const mockGameState: IGameState = {
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

describe('useReplay', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with default values', () => {
        const { result } = renderHook(() => 
            useReplay({ socket: mockSocket, gameCode: 'TEST123' })
        );

        expect(result.current.isPlaying).toBe(false);
        expect(result.current.currentMove).toBe(0);
        expect(result.current.totalMoves).toBe(0);
        expect(result.current.playbackSpeed).toBe(1);
        expect(result.current.gameState).toBeNull();
        expect(result.current.error).toBeNull();
    });

    it('should handle start replay', async () => {
        const { result } = renderHook(() => 
            useReplay({ socket: mockSocket, gameCode: 'TEST123' })
        );

        // Получаем обработчик события обновления состояния
        const mockHandler = vi.mocked(mockSocket.on).mock.calls
            .find(([event]) => event === ReplayEvent.REPLAY_STATE_UPDATED)?.[1];

        act(() => {
            result.current.startReplay();
            if (mockHandler) {
                mockHandler({ 
                    state: mockGameState, 
                    moveIndex: 0, 
                    totalMoves: 10 
                });
            }
        });

        expect(mockSocket.emit).toHaveBeenCalledWith(
            ReplayEvent.START_REPLAY,
            { gameCode: 'TEST123' }
        );
        expect(result.current.gameState).toEqual(mockGameState);
        expect(result.current.totalMoves).toBe(10);
    });

    it('should handle pause and resume', () => {
        const { result } = renderHook(() => 
            useReplay({ socket: mockSocket, gameCode: 'TEST123' })
        );

        // Имитируем паузу
        act(() => {
            result.current.pauseReplay();
        });

        expect(mockSocket.emit).toHaveBeenCalledWith(
            ReplayEvent.PAUSE_REPLAY,
            { gameCode: 'TEST123' }
        );

        // Имитируем возобновление
        act(() => {
            result.current.resumeReplay();
        });

        expect(mockSocket.emit).toHaveBeenCalledWith(
            ReplayEvent.RESUME_REPLAY,
            { gameCode: 'TEST123' }
        );
    });

    it('should handle navigation between moves', () => {
        const { result } = renderHook(() => 
            useReplay({ socket: mockSocket, gameCode: 'TEST123' })
        );

        // Следующий ход
        act(() => {
            result.current.nextMove();
        });

        expect(mockSocket.emit).toHaveBeenCalledWith(
            ReplayEvent.NEXT_MOVE,
            { gameCode: 'TEST123' }
        );

        // Предыдущий ход
        act(() => {
            result.current.previousMove();
        });

        expect(mockSocket.emit).toHaveBeenCalledWith(
            ReplayEvent.PREV_MOVE,
            { gameCode: 'TEST123' }
        );

        // Переход к конкретному ходу
        act(() => {
            result.current.goToMove(5);
        });

        expect(mockSocket.emit).toHaveBeenCalledWith(
            ReplayEvent.GOTO_MOVE,
            { gameCode: 'TEST123', moveIndex: 5 }
        );
    });

    it('should handle playback speed changes', () => {
        const { result } = renderHook(() => 
            useReplay({ socket: mockSocket, gameCode: 'TEST123' })
        );

        act(() => {
            result.current.setSpeed(2);
        });

        expect(mockSocket.emit).toHaveBeenCalledWith(
            ReplayEvent.SET_PLAYBACK_SPEED,
            { gameCode: 'TEST123', speed: 2 }
        );
    });

    it('should handle errors', () => {
        const { result } = renderHook(() => 
            useReplay({ socket: mockSocket, gameCode: 'TEST123' })
        );

        // Получаем обработчик события ошибки
        const mockErrorHandler = vi.mocked(mockSocket.on).mock.calls
            .find(([event]) => event === ReplayEvent.REPLAY_ERROR)?.[1];

        act(() => {
            if (mockErrorHandler) {
                mockErrorHandler({ message: 'Test error' });
            }
        });

        expect(result.current.error).toBe('Test error');
        expect(result.current.isPlaying).toBe(false);
    });

    it('should cleanup on unmount', () => {
        const { unmount } = renderHook(() => 
            useReplay({ socket: mockSocket, gameCode: 'TEST123' })
        );

        unmount();

        // Проверяем отписку от всех событий
        expect(mockSocket.off).toHaveBeenCalledWith(ReplayEvent.REPLAY_STATE_UPDATED, expect.any(Function));
        expect(mockSocket.off).toHaveBeenCalledWith(ReplayEvent.REPLAY_PAUSED, expect.any(Function));
        expect(mockSocket.off).toHaveBeenCalledWith(ReplayEvent.REPLAY_RESUMED, expect.any(Function));
        expect(mockSocket.off).toHaveBeenCalledWith(ReplayEvent.REPLAY_COMPLETED, expect.any(Function));
        expect(mockSocket.off).toHaveBeenCalledWith(ReplayEvent.REPLAY_ERROR, expect.any(Function));
    });
});