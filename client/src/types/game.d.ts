import { Socket } from 'socket.io-client';
import type {
    GameState,
    PlayerNumber,
    GameMove,
    Timestamp
} from '@ctor-game/shared/types/base/types.js';

// Client-specific game types
export type TurnOperationsState = {
    placeOperations: number;
    replaceOperations: number;
    player: PlayerNumber;
};

export type GameStateWithTurn = GameState & {
    currentTurn: TurnOperationsState;
    isFirstTurn: boolean;
};

// Mock types for testing
export type MockedSocket = Socket & {
    mockEmit: jest.Mock;
    mockOn: jest.Mock;
    mockOff: jest.Mock;
    mockClose: jest.Mock;
    simulateEvent: (event: string, data: unknown) => Promise<void>;
};

export type GameHistoryEntry = {
    moveNumber: number;
    player: PlayerNumber;
    move: GameMove;
    timestamp: Timestamp;
};