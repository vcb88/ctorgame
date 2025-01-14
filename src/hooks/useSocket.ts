import { useEffect, useRef, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import type {
    ServerToClientEvents,
    ClientToServerEvents,
    GameCreatedResponse,
    GameJoinedResponse,
    GameStartedResponse,
    GameStateUpdatedResponse,
    GameOverResponse,
    PlayerDisconnectedResponse,
    PlayerReconnectedResponse,
    GameExpiredResponse,
    ErrorResponse
} from '../types/socket.new';
import type { IGameState } from '@ctor-game/shared/src/types/game/types.js';

const SOCKET_URL = process.env.VITE_WS_URL || 'http://localhost:8080';

export interface UseSocketOptions {
    // Connection callbacks
    onConnected?: () => void;
    onDisconnected?: () => void;
    onError?: (error: ErrorResponse) => void;

    // Game state callbacks
    onGameCreated?: (response: GameCreatedResponse) => void;
    onGameJoined?: (response: GameJoinedResponse) => void;
    onGameStarted?: (response: GameStartedResponse) => void;
    onGameStateUpdated?: (response: GameStateUpdatedResponse) => void;
    onGameOver?: (response: GameOverResponse) => void;

    // Player state callbacks
    onPlayerDisconnected?: (response: PlayerDisconnectedResponse) => void;
    onPlayerReconnected?: (response: PlayerReconnectedResponse) => void;
    onGameExpired?: (response: GameExpiredResponse) => void;
}

export interface UseSocketActions {
    createGame: () => void;
    joinGame: (gameId: string) => void;
    makeMove: (gameId: string, x: number, y: number, type: 'place' | 'replace') => void;
    endTurn: (gameId: string) => void;
    reconnectToGame: (gameId: string) => void;
    disconnect: () => void;
}

export const useSocket = (options: UseSocketOptions = {}): UseSocketActions => {
    const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

    // Socket actions
    const createGame = useCallback(() => {
        socketRef.current?.emit('create_game');
    }, []);

    const joinGame = useCallback((gameId: string) => {
        socketRef.current?.emit('join_game', { gameId });
    }, []);

    const makeMove = useCallback((gameId: string, x: number, y: number, type: 'place' | 'replace') => {
        socketRef.current?.emit('make_move', {
            gameId,
            move: {
                type,
                position: { x, y }
            }
        });
    }, []);

    const endTurn = useCallback((gameId: string) => {
        socketRef.current?.emit('end_turn', { gameId });
    }, []);

    const reconnectToGame = useCallback((gameId: string) => {
        socketRef.current?.emit('reconnect', { gameId });
    }, []);

    const disconnect = useCallback(() => {
        socketRef.current?.emit('disconnect');
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

        // Connection events
        socket.on('connect', () => {
            console.log('Connected to game server');
            options.onConnected?.();
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from game server');
            options.onDisconnected?.();
        });

        // Game events
        socket.on('error', (response) => {
            console.error('Socket error:', response);
            options.onError?.(response);
        });

        socket.on('game_created', (response) => {
            console.log('Game created:', response);
            options.onGameCreated?.(response);
        });

        socket.on('game_joined', (response) => {
            console.log('Game joined:', response);
            options.onGameJoined?.(response);
        });

        socket.on('game_started', (response) => {
            console.log('Game started:', response);
            options.onGameStarted?.(response);
        });

        socket.on('game_state_updated', (response) => {
            console.log('Game state updated:', response);
            options.onGameStateUpdated?.(response);
        });

        socket.on('game_over', (response) => {
            console.log('Game over:', response);
            options.onGameOver?.(response);
        });

        // Player events
        socket.on('player_disconnected', (response) => {
            console.log('Player disconnected:', response);
            options.onPlayerDisconnected?.(response);
        });

        socket.on('player_reconnected', (response) => {
            console.log('Player reconnected:', response);
            options.onPlayerReconnected?.(response);
        });

        socket.on('game_expired', (response) => {
            console.log('Game expired:', response);
            options.onGameExpired?.(response);
        });

        // Cleanup on unmount
        return () => {
            socket.removeAllListeners();
            socket.disconnect();
            socketRef.current = null;
        };
    }, [options]);

    return {
        createGame,
        joinGame,
        makeMove,
        endTurn,
        reconnectToGame,
        disconnect
    };
};