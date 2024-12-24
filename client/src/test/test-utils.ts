import { Socket } from 'socket.io-client';
import { vi } from 'vitest';

export const createMockSocket = () => {
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
    emit: function(event: string, ...args: any[]) {
      this.mockEmit(event, ...args);
    },
    on: function(event: string, callback: Function) {
      this.mockOn(event, callback);
      return this;
    },
    off: function(event: string) {
      this.mockOff(event);
      return this;
    },
    close: function() {
      this.mockClose();
    },
    // Метод для эмуляции получения события от сервера
    simulateEvent: function(event: string, data: any) {
      if (listeners[event]) {
        listeners[event].forEach(callback => callback(data));
      }
    }
  };

  return mockSocket as unknown as Socket;
};