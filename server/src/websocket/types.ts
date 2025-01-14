import type { Server as SocketIOServer, Socket } from 'socket.io';
import type {
    ServerToClientEvents,
    ClientToServerEvents,
    InterServerEvents,
    SocketData,
    WebSocketEvent
} from '@ctor-game/shared/types/network/websocket.new.js';

export type GameSocket = Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
>;

export type GameServer = SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
>;

export interface GameServerConfig {
    readonly cors: {
        readonly origin: string;
        readonly methods: string[];
    };
    readonly path: string;
    readonly transports: string[];
    readonly pingTimeout: number;
    readonly pingInterval: number;
    readonly maxHttpBufferSize: number;
}

export interface GameServerOptions {
    readonly config?: Partial<GameServerConfig>;
    readonly reconnectTimeout?: number;
}