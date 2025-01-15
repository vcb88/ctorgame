import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import type {
    IWebSocketEvent,
    WebSocketErrorCode,
    ServerToClientEvents,
    ClientToServerEvents,
    InterServerEvents,
    ISocketData,
    IWebSocketServerConfig,
    IWebSocketServerOptions
} from '@ctor-game/shared/src/types/network/websocket';
import { GameError, GameNotFoundError, NotYourTurnError, GameEndedError } from '../errors/GameError';
import { ErrorHandlingService } from '../services/ErrorHandlingService';

// Define socket types using imported interfaces
type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, ISocketData>;
type GameServerType = SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, ISocketData>;

import type {
    IGameState,
    IGameMove,
    PlayerNumber,
    GameStatus
} from '@ctor-game/shared/src/types/game/types';

// Services
import { redisService } from '../services/RedisService';
import { GameService } from '../services/GameService';
import { GameLogicService } from '../services/GameLogicService';
import { EventService } from '../services/EventService';
import { logger } from '../utils/logger';

const DEFAULT_CONFIG: IWebSocketServerConfig = {
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
    private errorHandlingService: ErrorHandlingService;
    private reconnectTimeout: number;

    public static getInstance(httpServer: HttpServer, options: IWebSocketServerOptions = {}): GameServer {
        if (!GameServer.instance) {
            GameServer.instance = new GameServer(httpServer, options);
        }
        return GameServer.instance;
    }

    private constructor(httpServer: HttpServer, options: IWebSocketServerOptions) {
        if ((global as any).io) {
            (global as any).io.close();
        }

        const config = { ...DEFAULT_CONFIG, ...options.config };
        this.reconnectTimeout = options.reconnectTimeout ?? DEFAULT_RECONNECT_TIMEOUT;

        this.io = new SocketIOServer(httpServer, config);
        this.gameService = new GameService(options.storageService, options.eventService, options.redisService);
        this.eventService = options.eventService || new EventService(redisService);
        this.errorHandlingService = ErrorHandlingService.getInstance();

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
            if (!isGameEvent(event)) {
                throw new GameError('server_error', 'Invalid game created event');
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
                throw new GameError('invalid_game_id', 'Either gameId or code must be provided');
            }

            // Find game by code if provided
            let targetGameId = gameId;
            if (code) {
                const game = await this.gameService.findGame(code);
                if (!game) {
                    throw new GameNotFoundError();
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
                throw new GameNotFoundError();
            }

            if (state.gameOver) {
                throw new GameEndedError();
            }

            const playerNumber = await redisService.getPlayerNumber(gameId, socket.id);
            if (!playerNumber) {
                throw new GameError('invalid_state', 'Player not found in game');
            }

            if (playerNumber !== state.currentPlayer) {
                throw new NotYourTurnError();
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
                throw new GameNotFoundError();
            }

            const playerNumber = await redisService.getPlayerNumber(gameId, socket.id);
            if (!playerNumber) {
                throw new GameError('invalid_state', 'Player not found in game');
            }

            if (playerNumber !== state.currentPlayer) {
                throw new NotYourTurnError();
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

    private async handleError(socket: GameSocket, error: Error | GameError): Promise<void> {
        // Log error with context
        this.errorHandlingService.logError(error, {
            component: 'GameServer',
            socketId: socket.id
        });

        try {
            // Get formatted error response
            const errorResponse = this.errorHandlingService.handleError(error);

            // Try to create error event if we have game session
            const session = await redisService.getPlayerSession(socket.id);
            if (session) {
                const errorEvent = await this.eventService.createErrorEvent(
                    session.gameId,
                    errorResponse,
                    socket.id
                );

                if (!isGameEvent(errorEvent)) {
                    this.errorHandlingService.logError(
                        new GameError('server_error', 'Invalid error event'),
                        { socketId: socket.id, gameId: session.gameId }
                    );
                }

                socket.emit('error', {
                    eventId: errorEvent.id,
                    ...errorResponse
                });
            } else {
                socket.emit('error', errorResponse);
            }
        } catch (err) {
            // Handle errors in error handling itself
            this.errorHandlingService.logError(err as Error, {
                component: 'GameServer',
                context: 'Error handler',
                socketId: socket.id
            });
            
            socket.emit('error', {
                code: 'server_error',
                message: 'Internal server error'
            });
        }
    }
}