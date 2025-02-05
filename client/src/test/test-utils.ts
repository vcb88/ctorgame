import { Socket } from 'socket.io-client';
import { vi } from 'vitest';

interface IMockSocket extends Socket {
  mockEmit: ReturnType<typeof vi.fn>;
  mockOn: ReturnType<typeof vi.fn>;
  mockOff: ReturnType<typeof vi.fn>;
  mockClose: ReturnType<typeof vi.fn>;
  simulateEvent: (event: string, data: unknown) => Promise<void>;
  getListeners: (event: string) => Function[];
}

export const createMockSocket = (): IMockSocket => {
  const listeners: Record<string, Function[]> = {};
  
  const mockSocket = {
    mockEmit: vi.fn(),
    mockOn: vi.fn((event: string, callback: Function) => {
      if (!listeners[event]) {
        listeners[event] = [];
      }
      listeners[event].push(callback);
    }),
    mockOff: vi.fn(),
    mockClose: vi.fn(),
    emit: function(event: string, ...args: unknown[]) {
      this.mockEmit(event, ...args);
      return Promise.resolve();
    },
    on: function(event: string, callback: Function) {
      this.mockOn(event, callback);
      if (!listeners[event]) {
        listeners[event] = [];
      }
      listeners[event].push(callback);
      return this;
    },
    off: function(event: string) {
      this.mockOff(event);
      if (listeners[event]) {
        delete listeners[event];
      }
      return this;
    },
    close: function() {
      this.mockClose();
      Object.keys(listeners).forEach(event => {
        delete listeners[event];
      });
    },
    // Метод для эмуляции получения события от сервера
    simulateEvent: async function(event: string, data: unknown) {
      if (listeners[event]) {
        await Promise.all(listeners[event].map(callback => Promise.resolve().then(() => callback(data))));
      }
    },
    // Получить все зарегистрированные обработчики для события
    getListeners: function(event: string) {
      return listeners[event] || [];
    }
  };

  return mockSocket as unknown as IMockSocket;
};