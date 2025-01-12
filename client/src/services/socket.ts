import { io, Socket } from 'socket.io-client';

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

let socket: Socket | null = null;

export const socketConfig = {
  transports: ['websocket', 'polling'],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 10000,
  path: '/socket.io/',
  forceNew: true
};

export function createSocket(config = socketConfig): Socket {
  if (!socket) {
    // В режиме разработки используем текущий хост, так как Vite проксирует запросы
    const wsUrl = window.location.origin;
    
    console.log('Creating socket connection to:', wsUrl);
    console.log('Socket configuration:', config);

    socket = io(wsUrl, config);

    // Логирование событий сокета
    socket.on('connect', () => console.log('Socket connected:', socket?.id));
    socket.on('connect_error', (err) => console.error('Socket connection error:', err));
    socket.on('disconnect', (reason) => console.log('Socket disconnected:', reason));
    socket.on('reconnect', (attempt) => console.log('Socket reconnected after attempt:', attempt));
  }
  return socket;
}

// Экспортируем getSocket для обратной совместимости
export function getSocket(): Socket {
  return createSocket();
}

// Экспортируем socket для использования в тестах
export { socket };

export function closeSocket() {
  if (socket) {
    socket.close();
    socket = null;
  }
}