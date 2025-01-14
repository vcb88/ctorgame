import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import type {
    GameSocket,
    GameServer as GameServerType,
    GameServerConfig,
    GameServerOptions
} from './types.js';

// Import event types
import type {
    GameEvent,
    IGameCreatedEvent,
    IGameStartedEvent,
    IGameMoveEvent,
    IGameEndedEvent,
    IGameExpiredEvent,
    IPlayerConnectedEvent,
    IPlayerDisconnectedEvent,
    IGameErrorEvent,
    validateGameEvent
} from '@ctor-game/shared/src/types/network/events.js';

import type {
    WebSocketEvent,
    WebSocketErrorCode,
    ServerToClientEvents
} from '@ctor-game/shared/src/types/network/websocket.js';

import type {
    IGameState,
    IGameMove,
    PlayerNumber,
    GameStatus
} from '@ctor-game/shared/src/types/game/types.js';

// Services
import { redisService } from '../services/RedisService.js';
import { GameService } from '../services/GameService.js';
import { GameLogicService } from '../services/GameLogicService.js';
import { EventService } from '../services/EventService.js';
import { logger } from '../utils/logger.js';

const DEFAULT_CONFIG: GameServerConfig = {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    path: '/socket.io/',
    transports: ['websocket'],
    pingTimeout: 10000,
    pingInterval: 5000,
    maxHttpBufferSize: 1e6
};

const DEFAULT_RECONNECT_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export class GameServer {
    private static instance: GameServer | null = null;
    private io: GameServerType;
    private gameService: GameService;
    private eventService: EventService;
    private reconnectTimeout: number;

    public static getInstance(httpServer: HttpServer, options: GameServerOptions = {}): GameServer {
        if (!GameServer.instance) {
            GameServer.instance = new GameServer(httpServer, options);
        }
        return GameServer.instance;
    }

    private constructor(httpServer: HttpServer, options: GameServerOptions) {
        if ((global as any).io) {
            (global as any).io.close();
        }

        const config = { ...DEFAULT_CONFIG, ...options.config };
        this.reconnectTimeout = options.reconnectTimeout ?? DEFAULT_RECONNECT_TIMEOUT;

        this.io = new SocketIOServer(httpServer, config);
        this.gameService = new GameService(options.storageService, options.eventService, options.redisService);
        this.eventService = options.eventService || new EventService(redisService);

        (global as any).io = this.io;
        this.setupEventHandlers();
    }

    private setupEventHandlers(): void {
        this.io.engine.on("connection_error", (err) => {
            logger.error("Connection error", {
                component: 'GameServer',
                error: err
            });
        });

        this.io.on('connection', this.handleConnection.bind(this));
    }

    private async handleConnection(socket: GameSocket): Promise<void> {
        logger.info('New client connection', {
            component: 'GameServer',
            context: {
                socketId: socket.id,
                transport: socket.conn.transport.name,
                remoteAddress: socket.handshake.address
            }
        });

        socket.on('create_game', () => this.handleCreateGame(socket));
        socket.on('join_game', (data) => this.handleJoinGame(socket, data));
        socket.on('make_move', (data) => this.handleMakeMove(socket, data));
        socket.on('end_turn', (data) => this.handleEndTurn(socket, data));
        socket.on('disconnect', () => this.handleDisconnect(socket));
    }

    private async handleCreateGame(socket: GameSocket): Promise<void> {
        try {
            const gameId = crypto.randomUUID();
            const game = await this.gameService.createGame(socket.id, gameId);
            await socket.join(gameId);

            const event = await this.eventService.createGameCreatedEvent(gameId, GameStatus.WAITING);
            if (!validateGameEvent(event)) {
                throw new Error('Invalid game created event');
            }

            socket.emit('game_created', {
                gameId,
                eventId: event.id,
                code: game.code,
                status: event.data.status
            });

        } catch (error) {
            await this.handleError(socket, error as Error);
        }
    }

    private async handleJoinGame(
        socket: GameSocket,
        { gameId, code }: { gameId?: string; code?: string }
    ): Promise<void> {
        try {
            if (!gameId && !code) {
                throw new Error('Either gameId or code must be provided');
            }

            // Find game by code if provided
            let targetGameId = gameId;
            if (code) {
                const game = await this.gameService.findGame(code);
                if (!game) {
                    throw new Error('Game not found');
                }
                targetGameId = game.gameId;
            }

            const game = await this.gameService.joinGame(targetGameId!, socket.id);
            await socket.join(targetGameId!);

            // Get state after join
            const state = await redisService.getGameState(targetGameId!);
            if (!state) {
                throw new Error('Game state not found');
            }

            // Emit player connected event
            const connectEvent = await this.eventService.createPlayerConnectedEvent(
                targetGameId!,
                socket.id,
                2 as PlayerNumber
            );

            if (!validateGameEvent(connectEvent)) {
                throw new Error('Invalid player connected event');
            }

            socket.emit('game_joined', {
                gameId: targetGameId,
                eventId: connectEvent.id,
                status: game.status
            });

            // If game is now ready to start
            if (game.players.first && game.players.second) {
                const startEvent = await this.eventService.createGameStartedEvent(targetGameId!, state);
                if (!validateGameEvent(startEvent)) {
                    throw new Error('Invalid game started event');
                }

                this.io.to(targetGameId!).emit('game_started', {
                    gameId: targetGameId,
                    eventId: startEvent.id,
                    gameState: state,
                    currentPlayer: state.currentPlayer
                });
            }

        } catch (error) {
            await this.handleError(socket, error as Error);
        }
    }

    private async handleMakeMove(
        socket: GameSocket,
        { gameId, move }: { gameId: string; move: IGameMove }
    ): Promise<void> {
        try {
            const state = await redisService.getGameState(gameId);
            if (!state) {
                throw new Error('Game not found');
            }

            if (state.gameOver) {
                throw new Error('Game is already finished');
            }

            const playerNumber = await redisService.getPlayerNumber(gameId, socket.id);
            if (!playerNumber) {
                throw new Error('Player not found in game');
            }

            if (playerNumber !== state.currentPlayer) {
                throw new Error('Not your turn');
            }

            // Apply move and get new state
            const updatedState = await this.gameService.makeMove(gameId, playerNumber, move);

            // Create and emit move event
            const moveEvent = await this.eventService.createGameMoveEvent(
                gameId,
                playerNumber,
                move,
                updatedState
            );

            if (!validateGameEvent(moveEvent)) {
                throw new Error('Invalid game move event');
            }

            this.io.to(gameId).emit('game_state_updated', {
                eventId: moveEvent.id,
                gameState: updatedState,
                currentPlayer: updatedState.currentPlayer
            });

            // Handle game over
            if (updatedState.gameOver) {
                const winner = updatedState.winner as PlayerNumber;
                const endEvent = await this.eventService.createGameEndedEvent(
                    gameId,
                    winner,
                    updatedState
                );

                if (!validateGameEvent(endEvent)) {
                    throw new Error('Invalid game ended event');
                }

                this.io.to(gameId).emit('game_over', {
                    eventId: endEvent.id,
                    gameState: updatedState,
                    winner
                });
            }

        } catch (error) {
            await this.handleError(socket, error as Error);
        }
    }

    private async handleEndTurn(socket: GameSocket, { gameId }: { gameId: string }): Promise<void> {
        try {
            const state = await redisService.getGameState(gameId);
            if (!state) {
                throw new Error('Game not found');
            }

            const playerNumber = await redisService.getPlayerNumber(gameId, socket.id);
            if (!playerNumber) {
                throw new Error('Player not found in game');
            }

            if (playerNumber !== state.currentPlayer) {
                throw new Error('Not your turn');
            }

            // Create end turn move
            const endTurnMove: IGameMove = { type: 'end_turn' };
            const updatedState = await this.gameService.makeMove(gameId, playerNumber, endTurnMove);

            const moveEvent = await this.eventService.createGameMoveEvent(
                gameId,
                playerNumber,
                endTurnMove,
                updatedState
            );

            if (!validateGameEvent(moveEvent)) {
                throw new Error('Invalid game move event');
            }

            this.io.to(gameId).emit('turn_ended', {
                eventId: moveEvent.id,
                gameState: updatedState,
                nextPlayer: updatedState.currentPlayer
            });

        } catch (error) {
            await this.handleError(socket, error as Error);
        }
    }

    private async handleDisconnect(socket: GameSocket): Promise<void> {
        try {
            const session = await redisService.getPlayerSession(socket.id);
            if (!session) return;

            const disconnectEvent = await this.eventService.createPlayerDisconnectedEvent(
                session.gameId,
                socket.id,
                session.playerNumber
            );

            if (!validateGameEvent(disconnectEvent)) {
                logger.warn('Invalid player disconnected event', {
                    component: 'GameServer',
                    context: { socketId: socket.id }
                });
            }

            this.io.to(session.gameId).emit('player_disconnected', {
                eventId: disconnectEvent.id,
                playerId: socket.id,
                playerNumber: session.playerNumber
            });

            // Start reconnection timeout
            setTimeout(async () => {
                const state = await redisService.getGameState(session.gameId);
                if (!state) return;

                // Check if player is still disconnected
                const currentSession = await redisService.getPlayerSession(socket.id);
                if (currentSession) return;

                const expireEvent = await this.eventService.createGameExpiredEvent(session.gameId);
                
                if (!validateGameEvent(expireEvent)) {
                    logger.warn('Invalid game expired event', {
                        component: 'GameServer',
                        context: { gameId: session.gameId }
                    });
                }

                this.io.to(session.gameId).emit('game_expired', {
                    eventId: expireEvent.id,
                    gameId: session.gameId
                });

                await this.gameService.expireGame(session.gameId);
            }, this.reconnectTimeout);

        } catch (error) {
            logger.error('Error handling disconnect', {
                component: 'GameServer',
                context: { socketId: socket.id },
                error
            });
        }
    }

    private async handleError(socket: GameSocket, error: Error): Promise<void> {
        logger.error('Game error', {
            component: 'GameServer',
            context: { socketId: socket.id },
            error
        });

        try {
            const session = await redisService.getPlayerSession(socket.id);
            if (session) {
                const errorEvent = await this.eventService.createErrorEvent(
                    session.gameId,
                    {
                        code: WebSocketErrorCode.InternalError,
                        message: error.message
                    },
                    socket.id
                );

                if (!validateGameEvent(errorEvent)) {
                    logger.warn('Invalid error event', {
                        component: 'GameServer',
                        context: { 
                            socketId: socket.id,
                            gameId: session.gameId
                        }
                    });
                }

                socket.emit('error', {
                    eventId: errorEvent.id,
                    code: WebSocketErrorCode.InternalError,
                    message: error.message
                });
            } else {
                socket.emit('error', {
                    code: WebSocketErrorCode.InternalError,
                    message: error.message
                });
            }
        } catch (err) {
            logger.error('Error creating error event', {
                component: 'GameServer',
                error: err
            });
            socket.emit('error', {
                code: WebSocketErrorCode.InternalError,
                message: error.message
            });
        }
    }
}