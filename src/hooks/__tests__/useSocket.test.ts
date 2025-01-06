import { renderHook, act } from '@testing-library/react';
import { useSocket, UseSocketOptions } from '../useSocket';
import { GameState } from '../../types/socket';
import { Socket } from 'socket.io-client';

// Mock socket.io-client
jest.mock('socket.io-client', () => {
    const mockSocket = {
        on: jest.fn(),
        emit: jest.fn(),
        removeAllListeners: jest.fn(),
        disconnect: jest.fn(),
    };
    return {
        __esModule: true,
        default: jest.fn(() => mockSocket),
    };
});

describe('useSocket', () => {
    let mockOptions: UseSocketOptions;
    let mockSocket: any;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();
        
        // Setup mock options
        mockOptions = {
            onConnected: jest.fn(),
            onDisconnected: jest.fn(),
            onError: jest.fn(),
            onGameCreated: jest.fn(),
            onGameJoined: jest.fn(),
            onGameStarted: jest.fn(),
            onGameUpdated: jest.fn(),
            onPlayerLeft: jest.fn(),
            onPlayerDisconnected: jest.fn(),
            onPlayerReconnected: jest.fn(),
        };

        // Get reference to mock socket
        mockSocket = require('socket.io-client').default();
    });

    it('initializes socket connection with correct options', () => {
        renderHook(() => useSocket(mockOptions));

        expect(require('socket.io-client').default).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                transports: ['websocket'],
                autoConnect: true,
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: 5,
            })
        );
    });

    it('registers all event handlers', () => {
        renderHook(() => useSocket(mockOptions));

        expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
        expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
        expect(mockSocket.on).toHaveBeenCalledWith('error', expect.any(Function));
        expect(mockSocket.on).toHaveBeenCalledWith('gameCreated', expect.any(Function));
        expect(mockSocket.on).toHaveBeenCalledWith('gameJoined', expect.any(Function));
        expect(mockSocket.on).toHaveBeenCalledWith('gameStarted', expect.any(Function));
        expect(mockSocket.on).toHaveBeenCalledWith('gameUpdated', expect.any(Function));
        expect(mockSocket.on).toHaveBeenCalledWith('playerLeft', expect.any(Function));
        expect(mockSocket.on).toHaveBeenCalledWith('playerDisconnected', expect.any(Function));
        expect(mockSocket.on).toHaveBeenCalledWith('playerReconnected', expect.any(Function));
    });

    it('calls onConnected when socket connects', () => {
        renderHook(() => useSocket(mockOptions));

        // Find and call the connect handler
        const connectHandler = mockSocket.on.mock.calls.find(
            call => call[0] === 'connect'
        )[1];
        connectHandler();

        expect(mockOptions.onConnected).toHaveBeenCalled();
    });

    it('calls onGameCreated with correct parameters', () => {
        renderHook(() => useSocket(mockOptions));

        // Find and call the gameCreated handler
        const gameCreatedHandler = mockSocket.on.mock.calls.find(
            call => call[0] === 'gameCreated'
        )[1];
        
        const mockResponse = {
            gameId: 'game123',
            code: '1234',
            playerNumber: 1,
        };
        gameCreatedHandler(mockResponse);

        expect(mockOptions.onGameCreated).toHaveBeenCalledWith(
            'game123',
            '1234',
            1
        );
    });

    it('calls onGameUpdated with transformed state', () => {
        renderHook(() => useSocket(mockOptions));

        const gameUpdatedHandler = mockSocket.on.mock.calls.find(
            call => call[0] === 'gameUpdated'
        )[1];
        
        const mockResponse = {
            gameId: 'game123',
            move: { x: 1, y: 2, player: 1, timestamp: 123456789 },
            nextPlayer: 2,
        };
        gameUpdatedHandler(mockResponse);

        expect(mockOptions.onGameUpdated).toHaveBeenCalledWith(
            'game123',
            {
                currentPlayer: 2,
                lastMove: { row: 2, col: 1 },
            }
        );
    });

    it('cleans up socket connection on unmount', () => {
        const { unmount } = renderHook(() => useSocket(mockOptions));
        unmount();

        expect(mockSocket.removeAllListeners).toHaveBeenCalled();
        expect(mockSocket.disconnect).toHaveBeenCalled();
    });

    it('reconnectToGame emits reconnect event', () => {
        const { result } = renderHook(() => useSocket(mockOptions));

        act(() => {
            result.current.reconnectToGame('game123');
        });

        expect(mockSocket.emit).toHaveBeenCalledWith('reconnect', { gameId: 'game123' });
    });
});