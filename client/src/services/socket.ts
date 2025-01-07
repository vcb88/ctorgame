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