import { Socket } from 'socket.io-client';
import { Mock, vi } from 'vitest';

interface Listener {
  event: string;
  callback: Function;
}

export interface MockSocket extends Socket {
  simulateEvent: (event: string, data: unknown) => Promise<void>;
  listeners: Listener[];
  mockEmit: Mock;
  mockClose: Mock;
  mockOff: Mock;
}

export function createMockSocket(): MockSocket {
  const listeners: Listener[] = [];
  let socket: MockSocket;

  const emit = vi.fn().mockImplementation(function(this: MockSocket) {
    return this;
  });

  const on = vi.fn(function(this: MockSocket, event: string, callback: Function) {
    listeners.push({ event, callback });
    return this;
  });

  const off = vi.fn(function(this: MockSocket, event: string, callback?: Function) {
    const index = callback 
      ? listeners.findIndex(l => l.event === event && l.callback === callback)
      : listeners.findIndex(l => l.event === event);
    if (index > -1) {
      listeners.splice(index, 1);
    }
    return this;
  });

  const close = vi.fn().mockImplementation(function(this: MockSocket) {
    return this;
  });

  socket = {
    // Mock-специфичные методы
    simulateEvent: async (event: string, data: unknown) => {
      const matchingListeners = listeners.filter(l => l.event === event);
      for (const listener of matchingListeners) {
        await Promise.resolve().then(() => listener.callback(data));
      }
      return Promise.resolve();
    },
    listeners,
    mockEmit: emit,
    mockClose: close,
    mockOff: off,

    // Socket.io методы
    emit,
    on,
    off,
    close,
    connected: true,
    volatile: { emit },
    timeout: function(this: MockSocket, ms: number) { return this; },
    disconnect: function(this: MockSocket) { return this; },
    connect: function(this: MockSocket) { return this; },
    send: function(this: MockSocket, ...args: any[]) { return this; },
    compress: function(this: MockSocket, compress: boolean) { return this; },

    // Socket.io свойства
    io: {} as any,
    nsp: '/',
    id: 'mock-socket-id',
    data: {},
    auth: {},
    recovered: false,
    receiveBuffer: [],
    sendBuffer: [],
    subs: [],
    flags: {},
    active: true,
  } as unknown as MockSocket;

  // Привязываем this к методам
  emit.mockThis(socket);
  on.mockThis(socket);
  off.mockThis(socket);
  close.mockThis(socket);

  return socket;
}