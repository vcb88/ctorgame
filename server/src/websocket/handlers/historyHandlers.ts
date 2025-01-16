import { Socket } from 'socket.io';
import { GameService } from '../../services/GameService.js';
import type { 
    HistoryClientEvents, 
    HistoryServerEvents 
} from '@ctor-game/shared/src/types/network/history.js';
import { createErrorResponse } from '@ctor-game/shared/utils/errors';
import { isGameHistoryEntry } from '@ctor-game/shared/utils/validation/replay';

export function registerHistoryHandlers(
    socket: Socket<HistoryClientEvents, HistoryServerEvents>,
    gameService: GameService
) {
    socket.on('GET_SAVED_GAMES', async () => {
        try {
            const games = await gameService.getSavedGames();
            
            // Validate all game history entries
            const validGames = games.filter(game => {
                try {
                    return isGameHistoryEntry(game);
                } catch (error) {
                    console.error('Invalid game history entry:', error);
                    return false;
                }
            });

            socket.emit('SAVED_GAMES', { games: validGames });
        } catch (error) {
            socket.emit('ERROR', createErrorResponse(error, 'Failed to get saved games'));
        }
    });
}