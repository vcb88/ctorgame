import { Socket } from 'socket.io-client';
import { vi } from 'vitest';

interface Listener {
  event: string;
  callback: Function;
}

// Создаем новый интерфейс без наследования от Socket
export interface MockSocket {
  emit: Socket['emit'] & { mock: { calls: any[][] }};
  on: Socket['on'] & { mock: { calls: any[][] }};
  off: Socket['off'] & { mock: { calls: any[][] }};
  close: Socket['close'] & { mock: { calls: any[][] }};
  simulateEvent: (event: string, data: unknown) => Promise<void>;
  listeners: Listener[];
  connected: boolean;
  mockEmit: Socket['emit'] & { mock: { calls: any[][] }};
  mockOn: Socket['on'] & { mock: { calls: any[][] }};
  mockOff: Socket['off'] & { mock: { calls: any[][] }};
  mockClose: Socket['close'] & { mock: { calls: any[][] }};
}

export function createMockSocket(): MockSocket {
  const listeners: Listener[] = [];

  // Создаем базовые моки функций
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

  // Создаем mock версии
  const mockEmit = vi.fn();
  const mockOn = vi.fn();
  const mockOff = vi.fn();
  const mockClose = vi.fn();

  const socket = {
    emit,
    on,
    off,
    close,
    mockEmit,
    mockOn,
    mockOff,
    mockClose,
    simulateEvent: async (event: string, data: unknown) => {
      const matchingListeners = listeners.filter(l => l.event === event);
      for (const listener of matchingListeners) {
        await Promise.resolve().then(() => listener.callback(data));
      }
    },
    listeners,
    connected: true
  } as unknown as MockSocket;

  return socket;
}