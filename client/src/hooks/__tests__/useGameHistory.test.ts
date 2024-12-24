import { renderHook, act } from '@testing-library/react-hooks';
import { useGameHistory, HistoryEntry } from '../useGameHistory';
import { Socket } from 'socket.io-client';
import { IGameMove, OperationType } from '@ctor-game/shared/types';

import { vi } from 'vitest';

// Мок для Socket.io
const mockSocket = {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
} as unknown as Socket;

// Мок для истории ходов
const mockMoves: HistoryEntry[] = [
    {
        moveNumber: 1,
        playerNumber: 0,
        move: {
            type: OperationType.PLACE,
            position: { row: 0, col: 0 }
        },
        timestamp: new Date('2024-12-24T10:00:00')
    },
    {
        moveNumber: 2,
        playerNumber: 1,
        move: {
            type: OperationType.PLACE,
            position: { row: 1, col: 1 }
        },
        timestamp: new Date('2024-12-24T10:00:05')
    }
];

describe('useGameHistory', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with loading state', () => {
        const { result } = renderHook(() => 
            useGameHistory({ socket: mockSocket, gameCode: 'TEST123' })
        );

        expect(result.current.loading).toBe(true);
        expect(result.current.moves).toEqual([]);
        expect(result.current.error).toBeNull();
    });

    it('should request game history on mount', () => {
        renderHook(() => 
            useGameHistory({ socket: mockSocket, gameCode: 'TEST123' })
        );

        expect(mockSocket.emit).toHaveBeenCalledWith(
            'GET_GAME_HISTORY',
            { gameCode: 'TEST123' }
        );
    });

    it('should handle received history', () => {
        const { result } = renderHook(() => 
            useGameHistory({ socket: mockSocket, gameCode: 'TEST123' })
        );

        // Получаем обработчик события истории
        const mockHandler = vi.mocked(mockSocket.on).mock.calls
            .find(([event]) => event === 'GAME_HISTORY')?.[1];

        act(() => {
            mockHandler({ moves: mockMoves });
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.moves).toEqual(mockMoves);
        expect(result.current.error).toBeNull();
    });

    it('should handle errors', () => {
        const { result } = renderHook(() => 
            useGameHistory({ socket: mockSocket, gameCode: 'TEST123' })
        );

        // Имитируем ошибку
        const mockErrorHandler = mockSocket.on.mock.calls.find(
            call => call[0] === 'ERROR'
        )[1];

        act(() => {
            mockErrorHandler({ message: 'Failed to load history' });
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Failed to load history');
    });

    it('should format move descriptions correctly', () => {
        const { result } = renderHook(() => 
            useGameHistory({ socket: mockSocket, gameCode: 'TEST123' })
        );

        const moveDescription = result.current.formatMoveDescription(mockMoves[0]);
        expect(moveDescription).toBe('Player 1 placed at (1,1)');

        const moveDescription2 = result.current.formatMoveDescription({
            ...mockMoves[0],
            move: {
                type: OperationType.REPLACE,
                position: { row: 2, col: 2 }
            }
        });
        expect(moveDescription2).toBe('Player 1 replaced at (3,3)');
    });

    it('should handle new moves', () => {
        const { result } = renderHook(() => 
            useGameHistory({ socket: mockSocket, gameCode: 'TEST123' })
        );

        // Имитируем получение начальной истории
        const historyHandler = mockSocket.on.mock.calls.find(
            call => call[0] === 'GAME_HISTORY'
        )[1];

        act(() => {
            historyHandler({ moves: mockMoves });
        });

        // Имитируем получение нового хода
        const newMoveHandler = mockSocket.on.mock.calls.find(
            call => call[0] === 'NEW_MOVE'
        )[1];

        const newMove: HistoryEntry = {
            moveNumber: 3,
            playerNumber: 0,
            move: {
                type: OperationType.REPLACE,
                position: { row: 2, col: 2 }
            },
            timestamp: new Date('2024-12-24T10:00:10')
        };

        act(() => {
            newMoveHandler(newMove);
        });

        expect(result.current.moves).toHaveLength(3);
        expect(result.current.moves[2]).toEqual(newMove);
    });

    it('should cleanup on unmount', () => {
        const { unmount } = renderHook(() => 
            useGameHistory({ socket: mockSocket, gameCode: 'TEST123' })
        );

        unmount();

        expect(mockSocket.off).toHaveBeenCalledWith('GAME_HISTORY', expect.any(Function));
        expect(mockSocket.off).toHaveBeenCalledWith('ERROR', expect.any(Function));
        expect(mockSocket.off).toHaveBeenCalledWith('NEW_MOVE', expect.any(Function));
    });
});