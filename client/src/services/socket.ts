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
    const wsUrl = (import.meta.env?.VITE_WS_URL as string) || 'ws://localhost:3000';
    socket = io(wsUrl, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
      reconnectionDelayMax: 6000,
      timeout: 10000
    });
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