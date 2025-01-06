import { Socket } from 'socket.io-client';
import { vi } from 'vitest';

interface Listener {
  event: string;
  callback: Function;
}

export interface MockSocket extends Socket {
  simulateEvent: (event: string, data: unknown) => Promise<void>;
  listeners: Listener[];
}

export function createMockSocket(): MockSocket {
  const listeners: Listener[] = [];

  const socket = {
    emit: vi.fn(),
    on: vi.fn((event: string, callback: Function) => {
      listeners.push({ event, callback });
      return socket;
    }),
    off: vi.fn((event: string, callback?: Function) => {
      const index = callback 
        ? listeners.findIndex(l => l.event === event && l.callback === callback)
        : listeners.findIndex(l => l.event === event);
      if (index > -1) {
        listeners.splice(index, 1);
      }
      return socket;
    }),
    close: vi.fn(),
    simulateEvent: async (event: string, data: unknown) => {
      const matchingListeners = listeners.filter(l => l.event === event);
      for (const listener of matchingListeners) {
        await Promise.resolve().then(() => listener.callback(data));
      }
    },
    listeners,
    // Добавляем свойство mock для совместимости с vi.fn()
    mock: {
      calls: [] as any[][]
    }
  } as unknown as MockSocket;

  // Добавляем свойства mock к методам
  (socket.emit as any).mock = { calls: [] };
  (socket.on as any).mock = { calls: [] };
  (socket.off as any).mock = { calls: [] };
  (socket.close as any).mock = { calls: [] };

  return socket;
}