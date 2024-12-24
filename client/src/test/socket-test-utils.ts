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

  // Создаем моки функций с помощью vi.fn()
  const emitMock = vi.fn();
  const onMock = vi.fn((event: string, callback: Function) => {
    listeners.push({ event, callback });
    return socket;
  });
  const offMock = vi.fn((event: string, callback?: Function) => {
    const index = callback 
      ? listeners.findIndex(l => l.event === event && l.callback === callback)
      : listeners.findIndex(l => l.event === event);
    if (index > -1) {
      listeners.splice(index, 1);
    }
    return socket;
  });
  const closeMock = vi.fn();

  const socket = {
    emit: emitMock,
    on: onMock,
    off: offMock,
    close: closeMock,
    simulateEvent: async (event: string, data: unknown) => {
      const matchingListeners = listeners.filter(l => l.event === event);
      for (const listener of matchingListeners) {
        await Promise.resolve().then(() => listener.callback(data));
      }
    },
    listeners
  } as unknown as MockSocket;

  return socket;
}