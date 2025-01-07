import { Socket } from 'socket.io-client';
import { Mock, vi } from 'vitest';

interface Listener {
  event: string;
  callback: Function;
}

export interface MockSocket extends Socket {
  simulateEvent: (event: string, data: unknown) => Promise<void>;
  _listeners: Listener[]; // internal storage
  listeners: Socket['listeners']; // maintain Socket.io type compatibility
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

  const off = vi.fn(function<Ev extends string>(this: MockSocket, ev?: Ev, listener?: Function) {
    if (!ev) {
      // Clear all listeners
      listeners.length = 0;
    } else if (!listener) {
      // Clear all listeners for event
      const indexes = listeners
        .map((l, i) => l.event === ev ? i : -1)
        .filter(i => i !== -1)
        .reverse();
      for (const index of indexes) {
        listeners.splice(index, 1);
      }
    } else {
      // Clear specific listener
      const index = listeners.findIndex(l => l.event === ev && l.callback === listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
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
    _listeners: listeners,
    listeners: (event: string) => {
      return listeners.filter(l => l.event === event).map(l => l.callback as any);
    },
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

  // Привязываем this к методам с использованием bind
  socket.emit = emit.bind(socket);
  socket.on = on.bind(socket);
  socket.off = off.bind(socket);
  socket.close = close.bind(socket);

  return socket;
}