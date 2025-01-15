import { Server as HTTPServer } from 'http';
import { GameServer } from './GameServer';
import { logger } from '../utils/logger';

export function initializeWebSocket(httpServer: HTTPServer) {
    logger.info('Initializing WebSocket server', {
        component: 'WebSocket',
        context: {
            clientUrl: process.env.CLIENT_URL || 'http://localhost:5173'
        }
    });

    const gameServer = GameServer.getInstance(httpServer, {
        config: {
            cors: {
                origin: process.env.CLIENT_URL || 'http://localhost:5173',
                methods: ['GET', 'POST']
            }
        }
    });

    return gameServer;
}