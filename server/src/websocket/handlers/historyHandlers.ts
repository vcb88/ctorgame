import { Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents, UUID, ErrorWithStack } from '@ctor-game/shared/types/core.js';
import { GameStorageService } from '../../services/GameStorageService.js';
import { ErrorHandlingService } from '../../services/ErrorHandlingService.js';
import { logger } from '../../utils/logger.js';

type Handler = (socket: Socket<ClientToServerEvents, ServerToClientEvents>, gameId: UUID) => Promise<void>;

export const createHistoryHandlers = (storageService: GameStorageService): Record<string, Handler> => ({
  async getGameHistory(socket, gameId) {
    try {
      const history = await storageService.getGameHistory(gameId);
      socket.emit('game_state', history);
    } catch (error) {
      const errorWithStack: ErrorWithStack = error instanceof Error ? {
        name: error.name || 'Error',
        message: error.message,
        code: 'STORAGE_ERROR',
        category: 'storage',
        severity: 'error',
        stack: error.stack || 'No stack trace available'
      } : {
        name: 'UnknownError',
        message: String(error),
        code: 'STORAGE_ERROR',
        category: 'storage',
        severity: 'error',
        stack: 'No stack trace available'
      };

      logger.error('Failed to get game history', {
        component: 'HistoryHandlers',
        error: errorWithStack,
        context: { gameId }
      });
      socket.emit('error', ErrorHandlingService.createNetworkError(
        'STORAGE_ERROR',
        'Failed to get game history',
        'error',
        { gameId }
      ));
    }
  }
});