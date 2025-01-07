import { Socket } from 'socket.io';
import { GameService } from '../../services/GameService';
import { GameStorageService } from '../../services/GameStorageService';
import { 
  IGameMove, 
  IPlayer, 
  IGameState,
  WebSocketEvents,
  BOARD_SIZE 
} from '@ctor-game/shared/types';
import { validateGameMove, validateGameState } from '@ctor-game/shared/validation/game';
import { GameEventResponse } from '../../types/events';

export function registerGameHandlers(
  socket: Socket, 
  gameService: GameService,
  storageService: GameStorageService
) {
    // Создание новой игры
    socket.on(WebSocketEvents.CreateGame, async () => {
        try {
            const gameCode = generateGameCode();
            const initialState: IGameState = {
                board: {
                    cells: Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(0)),
                    size: { width: BOARD_SIZE, height: BOARD_SIZE }
                },
                currentTurn: { 
                    placeOperationsLeft: 1, // Первый ход - 1 операция
                    moves: []
                },
                scores: { player1: 0, player2: 0 },
                gameOver: false,
                winner: null,
                isFirstTurn: true,
                currentPlayer: 0
            };

            // Создаем игру в Redis и MongoDB
            await Promise.all([
                gameService.createGame(gameCode, { id: socket.id, number: 0 }, initialState),
                storageService.createGame(socket.id)
            ]);

            socket.join(gameCode);
            socket.emit(WebSocketEvents.GameCreated, { gameId: gameCode });
        } catch (error) {
            socket.emit(WebSocketEvents.Error, { 
                message: error instanceof Error ? error.message : 'Failed to create game'
            });
        }
    });

    // Присоединение к существующей игре
    socket.on(WebSocketEvents.JoinGame, async ({ gameId }) => {
        try {
            // Получаем состояние игры из Redis
            const state = await gameService.getGameState(gameId);
            if (!state) {
                throw new Error('Game not found');
            }

            if (!validateGameState(state)) {
                throw new Error('Invalid game state');
            }

            // Присоединяем игрока
            const player: IPlayer = { id: socket.id, number: 1 };
            await Promise.all([
                gameService.joinGame(gameId, player),
                storageService.joinGame(gameId, socket.id)
            ]);

            socket.join(gameId);
            
            // Отправляем обновленное состояние всем игрокам
            socket.emit(WebSocketEvents.GameJoined, { gameId });
            socket.to(gameId).emit(WebSocketEvents.GameStarted, {
                gameState: state,
                currentPlayer: 0 // Первый ход всегда за первым игроком
            });
        } catch (error) {
            socket.emit(WebSocketEvents.Error, { 
                message: error instanceof Error ? error.message : 'Failed to join game'
            });
        }
    });

    // Выполнение хода
    socket.on(WebSocketEvents.MakeMove, async ({ gameId, move }) => {
        try {
            // Валидация хода
            if (!validateGameMove(move, { width: BOARD_SIZE, height: BOARD_SIZE })) {
                throw new Error('Invalid move format');
            }

            // Получаем текущее состояние
            const state = await gameService.getGameState(gameId);
            if (!state || !validateGameState(state)) {
                throw new Error('Invalid game state');
            }

            // Валидация хода
            const player = await gameService.getPlayer(gameId, socket.id);
            if (!player || player.number.toString() !== state.currentPlayer.toString()) {
                throw new Error('Not your turn');
            }

            // Применяем ход
            const updatedState = await gameService.makeMove(gameId, player.number, move);

            // Сохраняем в долгосрочное хранилище
            await storageService.recordMove(gameId, {
                ...move,
                playerNumber: player.number,
                timestamp: Date.now()
            });

            // Проверяем завершение игры
            if (updatedState.gameOver) {
                await storageService.finishGame(
                    gameId, 
                    updatedState.winner || -1, // В случае ничьей используем -1
                    {
                        1: updatedState.scores.player1,
                        2: updatedState.scores.player2
                    }
                );

                // Уведомляем игроков
                socket.to(gameId).emit(WebSocketEvents.GameOver, {
                    gameState: updatedState,
                    winner: updatedState.winner
                });
                socket.emit(WebSocketEvents.GameOver, {
                    gameState: updatedState,
                    winner: updatedState.winner
                });
            } else {
                // Уведомляем об обновлении состояния
                socket.to(gameId).emit(WebSocketEvents.GameStateUpdated, {
                    gameState: updatedState,
                    currentPlayer: updatedState.currentPlayer
                });
                socket.emit(WebSocketEvents.GameStateUpdated, {
                    gameState: updatedState,
                    currentPlayer: updatedState.currentPlayer
                });
            }
        } catch (error) {
            socket.emit(WebSocketEvents.Error, { 
                message: error instanceof Error ? error.message : 'Failed to make move'
            });
        }
    });
}

// Генерация уникального кода игры
function generateGameCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}