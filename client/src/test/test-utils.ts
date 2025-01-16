import { Socket } from 'socket.io-client';

export type MockSocket = Socket & {
    mockEmit: jest.Mock;
    mockOn: jest.Mock;
    mockOff: jest.Mock;
    mockClose: jest.Mock;
    simulateEvent: (event: string, data: unknown) => Promise<void>;
};