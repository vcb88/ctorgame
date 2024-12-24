import { io, Socket } from 'socket.io-client';
import { defineConfig } from 'vite';

export let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';
    socket = io(wsUrl, {
      transports: ['websocket'],
      autoConnect: true,
    });
  }
  return socket;
}

export function closeSocket() {
  if (socket) {
    socket.close();
    socket = null;
  }
}