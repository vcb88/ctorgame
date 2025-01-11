import { Socket } from 'socket.io';
import { GameService } from '../../services/GameService';
import { GameStorageService } from '../../services/GameStorageService';
import {
  IGameMove,
  IPlayer,
  IGameState,
  WebSocketEvents,
  BOARD_SIZE,
  IScores,
  Player,
  validateGameMove,
  validateGameState,
  isValidScores,
  GameMetadata
} from '../../shared';
import { GameEventResponse } from '../../types/events';
import { WebSocketErrorCode } from '../../types/errors';
import { logger } from '../../utils/logger';

export function registerGameHandlers(
  socket: Socket, 
  gameService: GameService,
  storageService: GameStorageService
) {
    // Создание новой игры
    socket.on(WebSocketEvents.CreateGame, async () => {
        try {
            const gameCode = generateGameCode();
            logger.info('CreateGame event received', {
                component: 'GameHandlers',
                event: WebSocketEvents.CreateGame,
                context: {
                    socketId: socket.id,
                    gameId: gameCode
                },
                data: {
                    transport: socket.conn.transport.name,
                    readyState: socket.conn.readyState,
                    rooms: Array.from(socket.rooms)
                }
            });

            const initialState: IGameState = {
                board: {
                    cells: Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)),
                    size: { width: BOARD_SIZE, height: BOARD_SIZE }
                },
                currentTurn: { 
                    placeOperationsLeft: 1, // Первый ход - 1 операция
                    moves: []
                },
                scores: { 
                    [Player.First]: 0,
                    [Player.Second]: 0
                } as IScores,
                gameOver: false,
                winner: null,
                isFirstTurn: true,
                currentPlayer: Player.First
            };

            logger.info('Creating game in storage', {
                component: 'GameHandlers',
                event: WebSocketEvents.CreateGame,
                context: {
                    socketId: socket.id,
                    gameId: gameCode
                },
                data: {
                    initialState,
                    player: { id: socket.id, number: Player.First }
                }
            });

            // Создаем игру в Redis и MongoDB
            try {
                await Promise.all([
                    gameService.createGame(gameCode, { id: socket.id, number: Player.First }, initialState),
                    storageService.createGame(socket.id)
                ]);

                logger.info('Game created successfully', {
                    component: 'GameHandlers',
                    event: WebSocketEvents.CreateGame,
                    context: {
                        socketId: socket.id,
                        gameId: gameCode
                    }
                });
            } catch (storageError) {
                logger.error('Failed to create game in storage', {
                    component: 'GameHandlers',
                    event: WebSocketEvents.CreateGame,
                    context: {
                        socketId: socket.id,
                        gameId: gameCode
                    },
                    data: {
                        error: storageError instanceof Error ? storageError.message : 'Unknown error'
                    }
                });
                throw storageError;
            }

            logger.info('Joining room and emitting GameCreated event', {
                component: 'GameHandlers',
                event: WebSocketEvents.GameCreated,
                context: {
                    socketId: socket.id,
                    gameId: gameCode
                },
                data: {
                    previousRooms: Array.from(socket.rooms)
                }
            });

            socket.join(gameCode);
            socket.emit(WebSocketEvents.GameCreated, { 
                gameId: gameCode,
                eventId: generateEventId()
            });
        } catch (error) {
            logger.error('Failed to create game', {
                component: 'GameHandlers',
                event: WebSocketEvents.CreateGame,
                context: {
                    socketId: socket.id
                },
                data: {
                    error: error instanceof Error ? {
                        message: error.message,
                        stack: error.stack
                    } : error
                }
            });

            socket.emit(WebSocketEvents.Error, { 
                message: error instanceof Error ? error.message : 'Failed to create game',
                code: WebSocketErrorCode.SERVER_ERROR,
                details: {
                    errorType: error instanceof Error ? error.constructor.name : typeof error
                }
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
            const player: IPlayer = { id: socket.id, number: Player.Second };
            await Promise.all([
                gameService.joinGame(gameId, player),
                storageService.joinGame(gameId, socket.id)
            ]);

            socket.join(gameId);
            
            // Отправляем обновленное состояние всем игрокам
            socket.emit(WebSocketEvents.GameJoined, { gameId });
            socket.to(gameId).emit(WebSocketEvents.GameStarted, {
                gameState: state,
                currentPlayer: Player.First // Первый ход всегда за первым игроком
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
            if (!player || player.number !== state.currentPlayer) {
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
                // Преобразуем scores в правильный формат
                const gameScores: IScores = isValidScores(updatedState.scores) ? updatedState.scores : {
                    [Player.First]: 0,
                    [Player.Second]: 0
                } as IScores;
                await storageService.finishGame(
                    gameId, 
                    updatedState.winner || Player.None, // В случае ничьей используем Player.None
                    gameScores
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

// Генерация ID события
function generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}