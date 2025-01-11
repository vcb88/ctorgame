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

export function getSocket(): Socket {
  if (!socket) {
    const wsUrl = (import.meta.env?.VITE_WS_URL as string) || window.location.origin;
    
    console.log('Creating socket connection to:', wsUrl);
    
    console.log('Socket configuration:', {
      url: wsUrl,
      path: '/socket.io/',
      transports: ['websocket', 'polling']
    });

    socket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
      reconnectionDelayMax: 6000,
      timeout: 20000, // Увеличим таймаут
      path: '/socket.io/',
      upgrade: true,
      forceNew: true
    });

    // Логирование событий сокета
    socket.on('connect', () => console.log('Socket connected:', socket?.id));
    socket.on('connect_error', (err) => console.error('Socket connection error:', err));
    socket.on('disconnect', (reason) => console.log('Socket disconnected:', reason));
    socket.on('reconnect', (attempt) => console.log('Socket reconnected after attempt:', attempt));
  }
  return socket;
}

// Экспортируем socket для использования в тестах
export { socket };

export function closeSocket() {
  if (socket) {
    socket.close();
    socket = null;
  }
}