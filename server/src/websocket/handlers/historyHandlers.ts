import { Socket } from 'socket.io';
import { GameService } from '../../services/GameService.js';
import type { IHistoryClientEvents, IHistoryServerEvents } from '@ctor-game/shared/types/network/history';
import { createErrorResponse } from '@ctor-game/shared/utils/errors';

export function registerHistoryHandlers(
    socket: Socket<IHistoryClientEvents, IHistoryServerEvents>,
    gameService: GameService
) {
    socket.on('GET_SAVED_GAMES', async () => {
        try {
            const games = await gameService.getSavedGames();
            socket.emit('SAVED_GAMES', { games });
        } catch (error) {
            socket.emit('ERROR', createErrorResponse(error, 'Failed to get saved games'));
        }
    });
}