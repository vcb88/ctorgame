import { useEffect, useRef, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import { GameEvents, GameState } from '../types/socket';

const SOCKET_URL = process.env.VITE_WS_URL || 'http://localhost:8080';

export interface UseSocketOptions {
    onConnected?: () => void;
    onDisconnected?: () => void;
    onError?: (error: string) => void;
    onGameCreated?: (gameId: string, code: string, playerNumber: number) => void;
    onGameJoined?: (gameId: string, playerNumber: number) => void;
    onGameStarted?: (gameId: string, state: GameState) => void;
    onGameUpdated?: (gameId: string, state: Partial<GameState>) => void;
    onPlayerLeft?: (gameId: string, playerId: string) => void;
    onPlayerDisconnected?: (gameId: string, playerId: string) => void;
    onPlayerReconnected?: (gameId: string, playerId: string) => void;
}

export const useSocket = (options: UseSocketOptions = {}) => {
    const socketRef = useRef<Socket<GameEvents> | null>(null);

    const reconnectToGame = useCallback((gameId: string) => {
        socketRef.current?.emit('reconnect', { gameId });
    }, []);

    useEffect(() => {
        // Create socket connection
        socketRef.current = io(SOCKET_URL, {
            transports: ['websocket'],
            autoConnect: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5
        });

        const socket = socketRef.current;

        // Connection event handlers
        socket.on('connect', () => {
            console.log('Connected to game server');
            options.onConnected?.();
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from game server');
            options.onDisconnected?.();
        });

        socket.on('error', (response) => {
            console.error('Socket error:', response.message);
            options.onError?.(response.message || 'Unknown error');
        });

        // Game event handlers
        socket.on('gameCreated', (response) => {
            options.onGameCreated?.(response.gameId, response.code, response.playerNumber);
        });

        socket.on('gameJoined', (response) => {
            options.onGameJoined?.(response.gameId, response.playerNumber);
        });

        socket.on('gameStarted', (response) => {
            options.onGameStarted?.(response.gameId, response.state);
        });

        socket.on('gameUpdated', (response) => {
            options.onGameUpdated?.(response.gameId, {
                currentPlayer: response.nextPlayer,
                lastMove: { row: response.move.y, col: response.move.x }
            });
        });

        socket.on('playerLeft', (response) => {
            options.onPlayerLeft?.(response.gameId, response.connectionId);
        });

        socket.on('playerDisconnected', (response) => {
            options.onPlayerDisconnected?.(response.gameId, response.connectionId);
        });

        socket.on('playerReconnected', (response) => {
            options.onPlayerReconnected?.(response.gameId, response.connectionId);
        });

        socket.on('gameReconnected', (response) => {
            options.onGameStarted?.(response.gameId, response.state);
        });

        // Cleanup on unmount
        return () => {
            if (socket) {
                socket.removeAllListeners();
                socket.disconnect();
            }
            socketRef.current = null;
        };
    }, [options]);

    return {
        socket: socketRef.current!,
        reconnectToGame
    };
};