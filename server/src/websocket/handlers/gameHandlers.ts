import { Socket } from 'socket.io';
import { GameService } from '../../services/GameService.js';
import { GameStorageService } from '../../services/GameStorageService.js';
// Game types and moves
import { GameMove } from '../../../shared/src/types/game/moves.js';
import { IGameState } from '../../../shared/src/types/game/state.js';
import { Player } from '../../../shared/src/types/base/enums.js';
import { IScores } from '../../../shared/src/types/game/state.js';
import { IPlayer } from '../../../shared/src/types/game/players.js';

// Constants
import { BOARD_SIZE } from '../../../shared/src/types/base/constants.js';

// Network events and errors
import {
  WebSocketEvents,
  WebSocketErrorCode
} from '../../../shared/src/types/base/network.js';

// Storage types
import {
  GameMetadata
} from '../../../shared/src/types/storage/metadata.js';

// Validation functions
import {
  validateGameMove,
  validateGameState
} from '../../../shared/src/validation/game.js';
import { GameEventResponse } from '../../types/events.js';
import { logger } from '../../utils/logger.js';
import { toErrorWithStack } from '../../types/error.js';

export function registerGameHandlers(
  socket: Socket, 
  gameService: GameService,
  storageService: GameStorageService
) {
    // Create a new game
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
                    placeOperationsLeft: 1,
                    replaceOperationsLeft: 0,
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
                    error: toErrorWithStack(storageError)
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
                error: toErrorWithStack(error)
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

    // Join an existing game
    socket.on(WebSocketEvents.JoinGame, async ({ gameId }) => {
        try {
            const normalizedGameId = gameId.toUpperCase();
            
            logger.info('[1/4] JoinGame request received', {
                component: 'GameHandlers',
                event: WebSocketEvents.JoinGame,
                context: {
                    socketId: socket.id,
                    originalGameId: gameId,
                    normalizedGameId,
                    timestamp: new Date().toISOString()
                },
                connection: {
                    transport: socket.conn.transport.name,
                    readyState: socket.conn.readyState,
                    headers: socket.handshake.headers
                }
            });

            const game = await gameService.findGame(normalizedGameId);
            if (!game) {
                const error = toErrorWithStack(new Error('Game not found'));
                logger.error('Game not found during join attempt', {
                    component: 'GameHandlers',
                    event: WebSocketEvents.JoinGame,
                    context: {
                        socketId: socket.id,
                        originalGameId: gameId,
                        normalizedGameId,
                        timestamp: new Date().toISOString()
                    },
                    error
                });
                
                const alternateGame = await gameService.findGame(gameId);
                if (alternateGame) {
                    logger.warn('Game found with different case', {
                        component: 'GameHandlers',
                        event: WebSocketEvents.JoinGame,
                        context: {
                            socketId: socket.id,
                            originalGameId: gameId,
                            normalizedGameId,
                            foundGameId: alternateGame.gameId
                        }
                    });
                }
                
                throw error;
            }
            const state = game.currentState;
            if (!state) {
                throw toErrorWithStack(new Error('Invalid game state - no current state found'));
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
                throw toErrorWithStack(new Error('Invalid game state'));
            }

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
            
            socket.emit(WebSocketEvents.GameJoined, { 
                gameId,
                eventId: generateEventId()
            });
            socket.to(gameId).emit(WebSocketEvents.GameStarted, {
                gameState: state,
                currentPlayer: Player.First,
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
                error: toErrorWithStack(error)
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

    // Make a move
    socket.on(WebSocketEvents.MakeMove, async ({ gameId, move }) => {
        try {
            if (!validateGameMove(move, { width: BOARD_SIZE, height: BOARD_SIZE })) {
                throw toErrorWithStack(new Error('Invalid move format'));
            }

            const state = await gameService.getGameState(gameId);
            if (!state || !validateGameState(state)) {
                throw toErrorWithStack(new Error('Invalid game state'));
            }

            const player = await gameService.getPlayer(gameId, socket.id);
            if (!player || player.number !== state.currentPlayer) {
                throw toErrorWithStack(new Error('Not your turn'));
            }

            const updatedState = await gameService.makeMove(gameId, player.number, move);

            await storageService.recordMove(gameId, {
                ...move,
                playerNumber: player.number,
                timestamp: Date.now()
            });

            if (updatedState.gameOver) {
                const gameScores: IScores = updatedState.scores || {
                    [Player.First]: 0,
                    [Player.Second]: 0
                } as IScores;
                await storageService.finishGame(
                    gameId, 
                    updatedState.winner || null,
                    gameScores
                );

                socket.to(gameId).emit(WebSocketEvents.GameOver, {
                    gameState: updatedState,
                    winner: updatedState.winner,
                    eventId: generateEventId()
                });

                socket.emit(WebSocketEvents.GameOver, {
                    gameState: updatedState,
                    winner: updatedState.winner,
                    eventId: generateEventId()
                });
            } else {
                socket.to(gameId).emit(WebSocketEvents.GameStateUpdated, {
                    gameState: updatedState,
                    lastMove: move,
                    eventId: generateEventId()
                });

                socket.emit(WebSocketEvents.GameStateUpdated, {
                    gameState: updatedState,
                    lastMove: move,
                    eventId: generateEventId()
                });
            }
        } catch (error) {
            logger.error('Failed to process move', {
                component: 'GameHandlers',
                event: WebSocketEvents.MakeMove,
                context: {
                    socketId: socket.id,
                    gameId,
                    move
                },
                error: toErrorWithStack(error)
            });

            socket.emit(WebSocketEvents.Error, {
                message: error instanceof Error ? error.message : 'Failed to process move',
                code: WebSocketErrorCode.INVALID_MOVE,
                details: {
                    errorType: error instanceof Error ? error.constructor.name : typeof error,
                    gameId,
                    move
                }
            });
        }
    });
}

function generateGameCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateEventId(): string {
    return `evt_${Math.random().toString(36).substring(2)}`;
}