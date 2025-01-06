import { Socket } from 'socket.io';
import { GameService } from '../../services/GameService';

export function registerHistoryHandlers(socket: Socket, gameService: GameService) {
    // Получение списка сохраненных игр
    socket.on('GET_SAVED_GAMES', async () => {
        try {
            const games = await gameService.getSavedGames();
            socket.emit('SAVED_GAMES', { games });
        } catch (error) {
            socket.emit('ERROR', { 
                message: error instanceof Error ? error.message : 'Failed to get saved games'
            });
        }
    });
}