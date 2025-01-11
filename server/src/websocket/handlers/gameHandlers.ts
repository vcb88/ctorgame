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
            const gameId = generateGameCode();
            logger.info('[1/5] CreateGame event received', {
                component: 'GameHandlers',
                event: WebSocketEvents.CreateGame,
                context: {
                    socketId: socket.id,
                    gameId,
                    timestamp: new Date().toISOString()
                },
                connection: {
                    transport: socket.conn.transport.name,
                    readyState: socket.conn.readyState,
                    rooms: Array.from(socket.rooms),
                    handshake: {
                        address: socket.handshake.address,
                        headers: socket.handshake.headers,
                        time: socket.handshake.time
                    }
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

            logger.info('[2/5] Initializing game state', {
                component: 'GameHandlers',
                event: WebSocketEvents.CreateGame,
                context: {
                    socketId: socket.id,
                    gameId,
                    timestamp: new Date().toISOString()
                },
                gameState: {
                    initialState,
                    boardSize: BOARD_SIZE,
                    firstPlayer: { id: socket.id, number: Player.First },
                    initialScores: initialState.scores,
                    turnConfig: { 
                        placeOperationsLeft: initialState.currentTurn.placeOperationsLeft,
                        isFirstTurn: initialState.isFirstTurn
                    }
                }
            });

            logger.info('[3/5] Creating game in storage services', {
                component: 'GameHandlers',
                event: WebSocketEvents.CreateGame,
                context: {
                    socketId: socket.id,
                    gameId,
                    timestamp: new Date().toISOString()
                },
                storage: {
                    services: ['GameService (Redis)', 'GameStorageService (MongoDB)'],
                    operation: 'createGame',
                    params: {
                        gameId,
                        playerId: socket.id,
                        playerNumber: Player.First,
                        initialStateSize: JSON.stringify(initialState).length
                    }
                }
            });

            try {
                const [gameServiceResult, storageServiceResult] = await Promise.all([
                    gameService.createGame(gameId, { id: socket.id, number: Player.First }, initialState),
                    storageService.createGame(socket.id, gameId)
                ]);

                logger.info('[4/5] Game created successfully', {
                    component: 'GameHandlers',
                    event: WebSocketEvents.CreateGame,
                    context: {
                        socketId: socket.id,
                        gameId
                    },
                    results: {
                        gameService: {
                            code: gameServiceResult.code,
                            status: gameServiceResult.status,
                            expiresAt: gameServiceResult.expiresAt
                        },
                        storageService: {
                            gameId: storageServiceResult.gameId,
                            code: storageServiceResult.code,
                            status: storageServiceResult.status
                        }
                    }
                });
            } catch (storageError) {
                logger.error('Failed to create game in storage', {
                    component: 'GameHandlers',
                    event: WebSocketEvents.CreateGame,
                    context: {
                        socketId: socket.id,
                        gameId
                    },
                    data: {
                        error: storageError instanceof Error ? storageError.message : 'Unknown error'
                    }
                });
                throw storageError;
            }

            const eventId = generateEventId();
            logger.info('[5/5] Setting up game room and notifying player', {
                component: 'GameHandlers',
                event: WebSocketEvents.GameCreated,
                context: {
                    socketId: socket.id,
                    gameId,
                    timestamp: new Date().toISOString()
                },
                room: {
                    previousRooms: Array.from(socket.rooms),
                    joiningRoom: gameId,
                    eventId
                },
                notification: {
                    event: WebSocketEvents.GameCreated,
                    payload: {
                        gameId,
                        eventId
                    }
                },
                waitingPhase: {
                    status: 'waiting_for_player2',
                    timeout: '30 minutes',
                    reconnectionWindow: '5 minutes'
                }
            });

            socket.join(gameId);
            socket.emit(WebSocketEvents.GameCreated, { 
                gameId,
                eventId
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
            logger.info('[1/4] JoinGame request received', {
                component: 'GameHandlers',
                event: WebSocketEvents.JoinGame,
                context: {
                    socketId: socket.id,
                    gameId,
                    timestamp: new Date().toISOString()
                },
                connection: {
                    transport: socket.conn.transport.name,
                    readyState: socket.conn.readyState,
                    headers: socket.handshake.headers
                }
            });

            // Получаем состояние игры из Redis
            const state = await gameService.getGameState(gameId);
            if (!state) {
                logger.error('Game not found during join attempt', {
                    component: 'GameHandlers',
                    event: WebSocketEvents.JoinGame,
                    context: {
                        socketId: socket.id,
                        gameId,
                        timestamp: new Date().toISOString()
                    },
                    error: {
                        type: 'GAME_NOT_FOUND',
                        details: {
                            searchParams: { gameId }
                        }
                    }
                });
                throw new Error('Game not found');
            }

            logger.info('[2/4] Game state validation', {
                component: 'GameHandlers',
                event: WebSocketEvents.JoinGame,
                context: {
                    socketId: socket.id,
                    gameId,
                    timestamp: new Date().toISOString()
                },
                gameState: {
                    boardState: state.board.size,
                    currentPlayer: state.currentPlayer,
                    turnInfo: state.currentTurn,
                    scores: state.scores,
                    isValid: validateGameState(state)
                }
            });

            if (!validateGameState(state)) {
                throw new Error('Invalid game state');
            }

            // Присоединяем игрока
            const player: IPlayer = { id: socket.id, number: Player.Second };
            logger.info('[3/4] Joining player to game', {
                component: 'GameHandlers',
                event: WebSocketEvents.JoinGame,
                context: {
                    socketId: socket.id,
                    gameId,
                    timestamp: new Date().toISOString()
                },
                player: {
                    id: socket.id,
                    number: Player.Second,
                    joiningServices: ['GameService', 'GameStorageService']
                }
            });

            const [gameJoinResult, storageJoinResult] = await Promise.all([
                gameService.joinGame(gameId, player),
                storageService.joinGame(gameId, socket.id)
            ]);

            logger.info('[4/4] Player joined successfully', {
                component: 'GameHandlers',
                event: WebSocketEvents.JoinGame,
                context: {
                    socketId: socket.id,
                    gameId,
                    timestamp: new Date().toISOString()
                },
                results: {
                    gameService: {
                        status: gameJoinResult.status,
                        code: gameJoinResult.code,
                        players: gameJoinResult.players
                    },
                    storageService: {
                        status: storageJoinResult.status,
                        code: storageJoinResult.code
                    }
                },
                notifications: {
                    toJoiningPlayer: WebSocketEvents.GameJoined,
                    toFirstPlayer: WebSocketEvents.GameStarted,
                    gameState: {
                        currentPlayer: Player.First,
                        isFirstTurn: true
                    }
                }
            });

            socket.join(gameId);
            
            // Отправляем обновленное состояние всем игрокам
            socket.emit(WebSocketEvents.GameJoined, { 
                gameId,
                eventId: generateEventId()
            });
            socket.to(gameId).emit(WebSocketEvents.GameStarted, {
                gameState: state,
                currentPlayer: Player.First, // Первый ход всегда за первым игроком
                eventId: generateEventId()
            });
        } catch (error) {
            logger.error('Failed to join game', {
                component: 'GameHandlers',
                event: WebSocketEvents.JoinGame,
                context: {
                    socketId: socket.id,
                    gameId,
                    timestamp: new Date().toISOString()
                },
                error: {
                    message: error instanceof Error ? error.message : 'Unknown error',
                    stack: error instanceof Error ? error.stack : undefined,
                    type: error instanceof Error ? error.constructor.name : typeof error
                }
            });

            socket.emit(WebSocketEvents.Error, { 
                message: error instanceof Error ? error.message : 'Failed to join game',
                code: WebSocketErrorCode.INVALID_GAME_ID,
                details: {
                    errorType: error instanceof Error ? error.constructor.name : typeof error,
                    gameId
                }
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