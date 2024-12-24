import { renderHook, act } from '@testing-library/react';
import { io } from 'socket.io-client';
import { useMultiplayerGame } from './useMultiplayerGame';
import { WebSocketEvents, IGameState } from '../../../shared/types';

// Мокаем socket.io-client
jest.mock('socket.io-client');

interface MockSocket {
  emit: jest.Mock;
  on: jest.Mock;
  off: jest.Mock;
  close: jest.Mock;
}

describe('useMultiplayerGame', () => {
  let mockSocket: MockSocket;
  let mockEmit: jest.Mock;
  let mockOn: jest.Mock;
  let mockOff: jest.Mock;

  beforeEach(() => {
    // Создаем моки для socket методов
    mockEmit = jest.fn();
    mockOn = jest.fn();
    mockOff = jest.fn();
    mockSocket = {
      emit: mockEmit,
      on: mockOn,
      off: mockOff,
      close: jest.fn(),
    };

    (io as jest.Mock).mockReturnValue(mockSocket);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ... rest of the test file remains the same ...
});