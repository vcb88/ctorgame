import { Server as HTTPServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { GameService } from '../services/GameService';
import { GameStorageService } from '../services/GameStorageService';
import { registerGameHandlers } from './handlers/gameHandlers';
import { registerReplayHandlers } from './handlers/replayHandlers';
import { registerHistoryHandlers } from './handlers/historyHandlers';
import { redisClient } from '../config/redis';

export function initializeWebSocket(httpServer: HTTPServer) {
    const io = new SocketServer(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
            methods: ['GET', 'POST']
        }
    });

    const gameService = new GameService();
    const storageService = new GameStorageService(process.env.MONGODB_URL, redisClient);

    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);

        // Регистрируем обработчики основных игровых событий
        registerGameHandlers(socket, gameService, storageService);

        // Регистрируем обработчики событий replay
        registerReplayHandlers(socket, gameService);

        // Регистрируем обработчики истории игр
        registerHistoryHandlers(socket, gameService);

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });

    return io;
}