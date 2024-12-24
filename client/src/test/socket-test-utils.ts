import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

export interface MockSocket extends Socket {
  mockEmit: jest.Mock;
  mockOn: jest.Mock;
  mockOff: jest.Mock;
  mockClose: jest.Mock;
  simulateEvent: (event: string, data: any) => Promise<void>;
}

export function createMockSocket(): MockSocket {
  const mockEmit = vi.fn();
  const mockOn = vi.fn();
  const mockOff = vi.fn();
  const mockClose = vi.fn();
  const listeners: Record<string, Function[]> = {};

  const socket = {
    emit: mockEmit,
    on: (event: string, callback: Function) => {
      if (!listeners[event]) {
        listeners[event] = [];
      }
      listeners[event].push(callback);
      mockOn(event, callback);
      return socket;
    },
    off: (event: string, callback?: Function) => {
      if (callback && listeners[event]) {
        const index = listeners[event].indexOf(callback);
        if (index > -1) {
          listeners[event].splice(index, 1);
        }
      } else {
        delete listeners[event];
      }
      mockOff(event, callback);
      return socket;
    },
    close: () => {
      mockClose();
      Object.keys(listeners).forEach(event => {
        delete listeners[event];
      });
    },
    simulateEvent: async (event: string, data: any) => {
      if (listeners[event]) {
        await Promise.all(listeners[event].map(callback => Promise.resolve().then(() => callback(data))));
      }
    },
    mockEmit,
    mockOn,
    mockOff,
    mockClose,
  } as unknown as MockSocket;

  return socket;
}