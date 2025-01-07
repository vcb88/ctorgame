import { Socket } from 'socket.io-client';
import { vi } from 'vitest';

interface Listener {
  event: string;
  callback: Function;
}

export interface MockSocket extends Socket {
  simulateEvent: (event: string, data: unknown) => Promise<void>;
  listeners: Listener[];
  mockEmit: ReturnType<typeof vi.fn>;
  mockClose: ReturnType<typeof vi.fn>;
  mockOff: ReturnType<typeof vi.fn>;
  emit: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
  off: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
}

export function createMockSocket(): MockSocket {
  const listeners: Listener[] = [];
  const emit = vi.fn();
  const on = vi.fn((event: string, callback: Function) => {
    listeners.push({ event, callback });
    return socket;
  });
  const off = vi.fn((event: string, callback?: Function) => {
    const index = callback 
      ? listeners.findIndex(l => l.event === event && l.callback === callback)
      : listeners.findIndex(l => l.event === event);
    if (index > -1) {
      listeners.splice(index, 1);
    }
    return socket;
  });
  const close = vi.fn();

  const socket = {
    emit,
    on,
    off,
    close,
    mockEmit: emit,
    mockClose: close,
    mockOff: off,
    simulateEvent: async (event: string, data: unknown) => {
      const matchingListeners = listeners.filter(l => l.event === event);
      for (const listener of matchingListeners) {
        await Promise.resolve().then(() => listener.callback(data));
      }
    },
    listeners,
    // Базовые свойства и методы Socket
    connected: true,
    volatile: { emit },
    timeout: (ms: number) => socket,
    disconnect: () => socket,
    connect: () => socket,
    send: (...args: any[]) => socket,
    compress: (compress: boolean) => socket,
    io: {} as any,
    nsp: '/',
    id: 'mock-socket-id',
    handshake: {} as any,
    data: {},
    auth: {},
  } as MockSocket;

  return socket;
}