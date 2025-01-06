import { useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';

const SOCKET_URL = process.env.VITE_WS_URL || 'ws://localhost:8080/ws';

export const useSocket = () => {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        // Create socket connection
        socketRef.current = io(SOCKET_URL, {
            transports: ['websocket'],
            autoConnect: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        });

        // Connection event handlers
        socketRef.current.on('connect', () => {
            console.log('Connected to game server');
        });

        socketRef.current.on('disconnect', () => {
            console.log('Disconnected from game server');
        });

        socketRef.current.on('error', (error: any) => {
            console.error('Socket error:', error);
        });

        // Cleanup on unmount
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []);

    return socketRef.current!;
};