import { Socket } from 'socket.io';
import { GameService } from '../../services/GameService';
import { IGameMove, IPlayer } from '@ctor-game/shared/types';

export function registerGameHandlers(socket: Socket, gameService: GameService) {
    // Создание новой игры
    socket.on('CREATE_GAME', async (player: IPlayer) => {
        try {
            const gameCode = generateGameCode();
            const initialState = {
                board: Array(10).fill(null).map(() => Array(10).fill(null)),
                currentTurn: { playerNumber: 0, placeOperationsLeft: 2, replaceOperationsLeft: 0 },
                scores: { player1: 0, player2: 0 },
                gameOver: false,
                winner: null
            };

            const game = await gameService.createGame(gameCode, player, initialState);
            socket.join(gameCode);
            socket.emit('GAME_CREATED', { gameCode, game });
        } catch (error) {
            socket.emit('ERROR', { message: error.message });
        }
    });

    // Присоединение к существующей игре
    socket.on('JOIN_GAME', async ({ gameCode, player }: { gameCode: string, player: IPlayer }) => {
        try {
            const game = await gameService.joinGame(gameCode, player);
            socket.join(gameCode);
            socket.to(gameCode).emit('PLAYER_JOINED', { player });
            socket.emit('GAME_JOINED', { game });
        } catch (error) {
            socket.emit('ERROR', { message: error.message });
        }
    });

    // Выполнение хода
    socket.on('MAKE_MOVE', async ({ gameCode, move, playerNumber }: { gameCode: string, move: IGameMove, playerNumber: number }) => {
        try {
            const updatedGame = await gameService.makeMove(gameCode, playerNumber, move);
            socket.to(gameCode).emit('GAME_UPDATED', { game: updatedGame });
            socket.emit('MOVE_ACCEPTED', { game: updatedGame });
        } catch (error) {
            socket.emit('ERROR', { message: error.message });
        }
    });
}

// Генерация уникального кода игры
function generateGameCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}