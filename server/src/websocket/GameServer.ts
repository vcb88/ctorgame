import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { Socket } from 'socket.io';

// Import all types from shared types module
import type {
    GameState,
    GameMove,
    PlayerNumber,
    GameStatus,
    WebSocketEvent,
    ServerToClientEvents,
    ClientToServerEvents,
    GameEvent,
    NetworkError,
    WebSocketErrorCode,
    WebSocketServerConfig,
    WebSocketServerOptions,
    GameStorageBase,
    GameEventService,
    RedisServiceType
} from '@ctor-game/shared/types/core.js';
import { validateEvent } from '@ctor-game/shared/utils/events.js';

// Constants
const GameStatusValues = {
    WAITING: 'waiting',
    PLAYING: 'playing',
    FINISHED: 'finished'
} as const;

// Services
import { GameService } from '../services/GameService.js';
import { GameLogicService } from '../services/GameLogicService.js';
import { EventService } from '../services/EventService.js';
import { RedisService } from '../services/RedisService.js';
const redisService = new RedisService();
import { GameStorageService } from '../services/GameStorageService.js';
import { logger } from '../utils/logger.js';
import { createGameError } from '@ctor-game/shared/utils/errors.js';

const DEFAULT_CONFIG: WebSocketServerConfig = {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    path: '/socket.io/',
    transports: ['websocket'] as any, // Type assertion needed for Socket.IO type compatibility
};

const PLAYER_RECONNECT_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export class GameServer {
    private io: Server<ClientToServerEvents, ServerToClientEvents>;
    private gameService: GameService;
    private eventService: GameEventService;
    private static instance: GameServer | null = null;

    public static getInstance(
        httpServer: HttpServer,
        options: WebSocketServerOptions = {}
    ): GameServer {
        if (!GameServer.instance) {
            logger.info("Creating new GameServer instance", { component: 'GameServer' });
            GameServer.instance = new GameServer(httpServer, options);
        } else {
            logger.info("Returning existing GameServer instance", { component: 'GameServer' });
        }
        return GameServer.instance;
    }

    private constructor(
        httpServer: HttpServer,
        options: WebSocketServerOptions
    ) {
        if ((global as any).io) {
            logger.info("Cleaning up previous Socket.IO instance", { component: 'GameServer' });
            (global as any).io.close();
        }

        const config = { ...DEFAULT_CONFIG, ...options.config };
        this.io = new Server(httpServer, {
            ...config,
            transports: ['websocket'] as any // Type assertion needed for Socket.IO type compatibility
        });

        // Initialize required services with defaults if not provided
        const redis = options.redisService || redisService;
        const storage = options.storageService || new GameStorageService(process.env.MONGODB_URL, redis, process.env.STORAGE_PATH);
        this.eventService = options.eventService || new EventService(redis);
        this.gameService = options.gameService || new GameService(
            storage,
            this.eventService,
            redis
        );

        (global as any).io = this.io;
        this.setupEventHandlers();
    }

    private setupEventHandlers(): void {
        this.io.engine.on("connection_error", (err) => {
            logger.error("Connection error", {
                component: 'GameServer',
                error: createGameError('WEBSOCKET_ERROR', err.message, err)
            });
        });

        this.io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
            // Log all incoming messages
            socket.onAny((eventName: string, ...args: any[]) => {
                logger.websocket.message('in', eventName, args[0], socket.id);
            });

            // Wrap emit for logging
            const originalEmit = socket.emit;
            socket.emit = function<Ev extends keyof ServerToClientEvents>(
                this: typeof socket,
                ev: Ev,
                ...args: Parameters<ServerToClientEvents[Ev]>
            ) {
                logger.websocket.message('out', ev, args[0], socket.id);
                return originalEmit.apply(this, [ev, ...args]);
            } as typeof socket.emit;

            // Wrap room emit for logging
            const originalTo = this.io.to;
            this.io.to = (room: string) => {
                const result = originalTo.call(this.io, room);
                const originalRoomEmit = result.emit;
                result.emit = function<Ev extends keyof ServerToClientEvents>(
                    this: typeof result,
                    ev: Ev,
                    ...args: Parameters<ServerToClientEvents[Ev]>
                ) {
                    logger.websocket.message('out', ev, args[0], `room:${room}`);
                    return originalRoomEmit.apply(this, [ev, ...args]);
                } as typeof result.emit;
                return result;
            };

            logger.info('New client connection', {
                component: 'GameServer',
                context: {
                    socketId: socket.id,
                    transport: socket.conn.transport.name,
                    remoteAddress: socket.handshake.address,
                    userAgent: socket.handshake.headers['user-agent']
                }
            });

            socket.on('create_game', async () => {
                try {
                    const gameId = crypto.randomUUID();
                    const game = await this.gameService.createGame(socket.id, gameId);
                    await socket.join(gameId);

                    const event = await this.eventService.createGameCreatedEvent(gameId, GameStatusValues.WAITING);
                    if (!validateEvent(event)) {
                        throw new Error('Invalid game created event');
                    }

                    logger.info('Game created', {
                        component: 'GameServer',
                        context: {
                            gameId,
                            code: game.code,
                            playerId: socket.id
                        }
                    });

                    socket.emit('game_created', {
                        ...event,
                        code: game.code,
                        status: event.data?.status || 'waiting'
                    });

                } catch (err) {
                    const error = this.createNetworkError(err);
                    logger.error('Error creating game', {
                        component: 'GameServer',
                        context: { playerId: socket.id },
                        error
                    });
                    socket.emit('error', error);
                }
            });

            socket.on('join_game', async (data: { gameId?: string; code?: string }) => {
                try {
                    if (!data.gameId && !data.code) {
                        throw new Error('Either gameId or code must be provided');
                    }

                    // Find game by code if provided
                    let targetGameId = data.gameId;
                    if (data.code) {
                        const game = await this.gameService.findGame(data.code);
                        if (!game) {
                            throw new Error('Game not found');
                        }
                        targetGameId = game.gameId;
                    }

                    if (!targetGameId) {
                        throw new Error('Game ID is required');
                    }

                    const game = await this.gameService.joinGame(targetGameId, socket.id);
                    await socket.join(targetGameId);

                    // Get state after join
                    const state = await redisService.getGameState(targetGameId);
                    if (!state) {
                        throw new Error('Game state not found');
                    }

                    const connectEvent = await this.eventService.createPlayerConnectedEvent(
                        targetGameId,
                        socket.id,
                        2 as PlayerNumber
                    );

                    if (!validateEvent(connectEvent)) {
                        throw new Error('Invalid player connected event');
                    }

                    socket.emit('game_joined', {
                        ...connectEvent,
                        status: game.status
                    });

                    // If game is now ready to start
                    if (game.players.length === 2) {
                        const startEvent = await this.eventService.createGameStartedEvent(targetGameId, state);
                        if (!validateEvent(startEvent)) {
                            throw new Error('Invalid game started event');
                        }

                        this.io.to(targetGameId).emit('game_started', {
                            ...startEvent,
                            gameState: state,
                            currentPlayer: state.currentPlayer
                        });
                    }

                } catch (err) {
                    const error = this.createNetworkError(err);
                    logger.error('Error joining game', {
                        component: 'GameServer',
                        context: { 
                            playerId: socket.id,
                            data
                        },
                        error
                    });
                    socket.emit('error', error);
                }
            });

            socket.on('make_move', async (data: { gameId: string; move: GameMove }) => {
                try {
                    if (!data.gameId) {
                        throw new Error('Game ID is required');
                    }

                    const session = await redisService.getPlayerSession(socket.id);
                    if (!session) {
                        throw new Error('Player session not found');
                    }

                    const state = await this.gameService.makeMove(data.gameId, session.playerNumber, data.move);
                    
                    const moveEvent = await this.eventService.createGameMoveEvent(
                        data.gameId,
                        socket.id,
                        data.move,
                        state
                    );

                    if (!validateEvent(moveEvent)) {
                        throw new Error('Invalid game move event');
                    }

                    this.io.to(data.gameId).emit('game_state_updated', state);

                    if (state.status === 'finished' && state.winner) {
                        const endEvent = await this.eventService.createGameEndedEvent(
                            data.gameId,
                            state.winner,
                            state
                        );

                        if (!validateEvent(endEvent)) {
                            throw new Error('Invalid game ended event');
                        }

                        this.io.to(data.gameId).emit('game_ended', {
                            ...endEvent,
                            winner: state.winner,
                            finalState: state
                        });
                    }

                } catch (err) {
                    const error = this.createNetworkError(err);
                    logger.error('Error making move', {
                        component: 'GameServer',
                        context: { 
                            playerId: socket.id,
                            data
                        },
                        error
                    });
                    socket.emit('error', error);
                }
            });

            socket.on('end_turn', async (data: { gameId: string }) => {
                try {
                    if (!data.gameId) {
                        throw new Error('Game ID is required');
                    }

                    const session = await redisService.getPlayerSession(socket.id);
                    if (!session) {
                        throw new Error('Player session not found');
                    }

                    const state = await redisService.getGameState(data.gameId);
                    if (!state) {
                        throw new Error('Game state not found');
                    }

                    const endTurnMove: GameMove = {
                        type: 'skip',
                        position: [0, 0], // default position for skip move
                        player: session.playerNumber,
                        timestamp: Date.now()
                    };

                    const updatedState = await this.gameService.makeMove(data.gameId, session.playerNumber, endTurnMove);
                    
                    this.io.to(data.gameId).emit('turn_ended', updatedState.currentPlayer);

                } catch (err) {
                    const error = this.createNetworkError(err);
                    logger.error('Error ending turn', {
                        component: 'GameServer',
                        context: { 
                            playerId: socket.id,
                            data
                        },
                        error
                    });
                    socket.emit('error', error);
                }
            });

            socket.on('disconnect', async () => {
                try {
                    const session = await redisService.getPlayerSession(socket.id);
                    if (!session) return;

                    const disconnectEvent = await this.eventService.createPlayerDisconnectedEvent(
                        session.gameId,
                        socket.id,
                        session.playerNumber
                    );

                    if (!validateEvent(disconnectEvent)) {
                        logger.warn('Invalid player disconnected event', {
                            component: 'GameServer',
                            context: { socketId: socket.id }
                        });
                    }

                    this.io.to(session.gameId).emit('player_disconnected', session.playerNumber);

                    // Start reconnection timeout
                    setTimeout(async () => {
                        const state = await redisService.getGameState(session.gameId);
                        if (!state || state.status === 'finished') return;

                        // Check if player is still disconnected
                        const currentSession = await redisService.getPlayerSession(socket.id);
                        if (currentSession) return;

                        const expireEvent = await this.eventService.createGameExpiredEvent(session.gameId);
                        
                        if (!validateEvent(expireEvent)) {
                            logger.warn('Invalid game expired event', {
                                component: 'GameServer',
                                context: { gameId: session.gameId }
                            });
                        }

                        this.io.to(session.gameId).emit('game_expired', session.gameId);

                        await this.gameService.expireGame(session.gameId);
                    }, PLAYER_RECONNECT_TIMEOUT);

                } catch (err) {
                    logger.error('Error handling disconnect', {
                        component: 'GameServer',
                        context: { socketId: socket.id },
                        error: this.createNetworkError(err)
                    });
                }
            });
        });
    }

    private createNetworkError(error: unknown): NetworkError {
        const errorWithStack = error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: error.stack || 'No stack trace available',
            cause: error.cause
        } : {
            name: 'UnknownError',
            message: 'An unknown error occurred',
            stack: 'No stack trace available'
        };

        return {
            code: 'INTERNAL_ERROR',
            message: errorWithStack.message,
            category: 'network',
            severity: 'error',
            stack: errorWithStack.stack,
            cause: errorWithStack.cause,
            timestamp: Date.now(),
            name: errorWithStack.name
        };
    }
}