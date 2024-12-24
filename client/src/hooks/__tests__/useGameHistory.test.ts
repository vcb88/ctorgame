import { renderHook } from '@testing-library/react';
import { useGameHistory, HistoryEntry } from '../useGameHistory';
import { OperationType } from '@ctor-game/shared/types';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { createMockSocket, type MockSocket } from '@/test/socket-test-utils';

describe('useGameHistory', () => {
    let mockSocket: MockSocket;

    beforeEach(() => {
        vi.clearAllMocks();
        mockSocket = createMockSocket();
    });

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

        expect(mockSocket.emit).toHaveBeenCalledWith('GET_GAME_HISTORY', { gameCode: 'TEST123' });
    });

    it('should handle received history', async () => {
        const { result } = renderHook(() => 
            useGameHistory({ socket: mockSocket, gameCode: 'TEST123' })
        );

        await mockSocket.simulateEvent('GAME_HISTORY', { moves: mockMoves });
        
        // Ждём обновления состояния
        await vi.waitFor(() => {
            expect(result.current.loading).toBe(false);
            expect(result.current.moves).toEqual(mockMoves);
            expect(result.current.error).toBeNull();
        });
    });

    it('should handle errors', async () => {
        const { result } = renderHook(() => 
            useGameHistory({ socket: mockSocket, gameCode: 'TEST123' })
        );

        await mockSocket.simulateEvent('ERROR', { message: 'Failed to load history' });

        // Ждём обновления состояния
        await vi.waitFor(() => {
            expect(result.current.loading).toBe(false);
            expect(result.current.error).toBe('Failed to load history');
        });
    });

    it('should format move descriptions correctly', () => {
        const { result } = renderHook(() => 
            useGameHistory({ socket: mockSocket, gameCode: 'TEST123' })
        );

        // Проверяем форматирование PLACE операции
        const moveDescription = result.current.formatMoveDescription(mockMoves[0]);
        expect(moveDescription).toBe('Player 1 placed at (1,1)');

        // Проверяем форматирование REPLACE операции
        const moveDescription2 = result.current.formatMoveDescription({
            ...mockMoves[0],
            move: {
                type: OperationType.REPLACE,
                position: { row: 0, col: 0 }
            }
        });
        expect(moveDescription2).toBe('Player 1 replaced at (1,1)');
    });

    it('should handle new moves', async () => {
        const { result } = renderHook(() => 
            useGameHistory({ socket: mockSocket, gameCode: 'TEST123' })
        );

        // Сначала получаем начальную историю
        await mockSocket.simulateEvent('GAME_HISTORY', { moves: mockMoves });

        // Ждём обновления состояния после получения истории
        await vi.waitFor(() => {
            expect(result.current.moves).toEqual(mockMoves);
        });

        // Затем получаем новый ход
        const newMove: HistoryEntry = {
            moveNumber: 3,
            playerNumber: 0,
            move: {
                type: OperationType.REPLACE,
                position: { row: 2, col: 2 }
            },
            timestamp: new Date('2024-12-24T10:00:10')
        };

        await mockSocket.simulateEvent('NEW_MOVE', newMove);

        // Ждём обновления состояния после нового хода
        await vi.waitFor(() => {
            expect(result.current.moves).toHaveLength(3);
            expect(result.current.moves[2]).toEqual(newMove);
        });
    });

    it('should cleanup on unmount', () => {
        const { unmount } = renderHook(() => 
            useGameHistory({ socket: mockSocket, gameCode: 'TEST123' })
        );

        unmount();

        // Проверяем, что все слушатели были удалены
        const eventTypes = ['GAME_HISTORY', 'ERROR', 'NEW_MOVE'];
        
        for (const eventType of eventTypes) {
            expect(mockSocket.listeners.filter(l => l.event === eventType)).toHaveLength(0);
        }

        expect(mockSocket.off).toHaveBeenCalledTimes(3);
    });
});