import { io, Socket } from 'socket.io-client';
import { NetworkError } from '../types/network.js';

type ServerToClientEvents = {
    connect: () => void;
    disconnect: (reason: string) => void;
    error: (error: NetworkError) => void;
    connect_error: (error: NetworkError) => void;
}

type ClientToServerEvents = {
    // Add client-to-server events here
}

interface ImportMetaEnv {
  VITE_WS_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  interface ImportMetaEnv {
    VITE_WS_URL: string;
  }
}

type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
let socket: GameSocket | null = null;

export const socketConfig: {
    autoConnect: boolean;
    reconnection: boolean;
    reconnectionAttempts: number;
    reconnectionDelay: number;
    reconnectionDelayMax: number;
    forceNew: boolean;
} = {
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    path: '/socket.io/',
    forceNew: true,
    pingTimeout: 10000,
    pingInterval: 5000,
    maxHttpBufferSize: 1e6,
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
};

export function createSocket(config = socketConfig): GameSocket {
  if (!socket) {
    // В режиме разработки используем текущий хост, так как Vite проксирует запросы
    const wsUrl = window.location.origin;
    const timestamp = Date.now();
    
    console.log('[Socket] Creating connection to:', wsUrl);
    console.log('[Socket] Configuration:', config);

    socket = io(wsUrl, config) as GameSocket;

    // Логирование событий сокета
    socket.on('connect', () => {
      console.log('[Socket] Connected, id:', socket?.id);
    });

    socket.on('connect_error', (error: NetworkError) => {
      console.error('[Socket] Connection error:', {
        code: error.code,
        message: error.message,
        severity: error.severity,
        timestamp: error.timestamp || timestamp
      });
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    socket.on('error', (error: NetworkError) => {
      console.error('[Socket] Error:', {
        code: error.code,
        message: error.message,
        severity: error.severity,
        timestamp: error.timestamp || timestamp
      });
    });
  }
  return socket;
}

// Экспортируем getSocket для обратной совместимости
export function getSocket(): GameSocket {
  return createSocket();
}

// Экспортируем socket и типы для использования в тестах и компонентах
export { socket, type GameSocket };

export function closeSocket(): void {
  if (socket) {
    const timestamp = Date.now();
    console.log('[Socket] Closing connection, timestamp:', timestamp);
    socket.close();
    socket = null;
  }
}