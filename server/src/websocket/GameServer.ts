import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { Socket } from 'socket.io';

// Game types
import type {
    IGameState,
    IGameMove,
    PlayerNumber,
    GameStatus,
    IGameScores
} from '@ctor-game/shared/src/types/game/types';

// Event types
import type {
    GameEvent,
    validateGameEvent
} from '@ctor-game/shared/src/types/network/events';

// Socket types
import type {
    WebSocketEvent,
    WebSocketErrorCode,
    ServerToClientEvents,
    ClientToServerEvents
} from '@ctor-game/shared/src/types/network/websocket';

// Services
import { GameService } from '../services/GameService.js';
import { GameLogicService } from '../services/GameLogicService.js';
import { EventService } from '../services/EventService.js';
import { redisService } from '../services/RedisService.js';
import { logger } from '../utils/logger.js';
import { toErrorWithStack } from '../types/error.js';

const DEFAULT_CONFIG = {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    path: '/socket.io/',
    transports: ['websocket'],
    serveClient: false,
    pingTimeout: 10000,
    pingInterval: 5000,
    upgradeTimeout: 10000,
    maxHttpBufferSize: 1e6,
} as const;

const PLAYER_RECONNECT_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export class GameServer {
    private io: Server<ClientToServerEvents, ServerToClientEvents>;
    private gameService: GameService;
    private eventService: EventService;
    private static instance: GameServer | null = null;

    public static getInstance(
        httpServer: HttpServer,
        options: {
            gameService?: GameService;
            eventService?: EventService;
        } = {}
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
        options: {
            gameService?: GameService;
            eventService?: EventService;
        }
    ) {
        if ((global as any).io) {
            logger.info("Cleaning up previous Socket.IO instance", { component: 'GameServer' });
            (global as any).io.close();
        }

        this.io = new Server(httpServer, DEFAULT_CONFIG);
        this.gameService = options.gameService || new GameService();
        this.eventService = options.eventService || new EventService();

        (global as any).io = this.io;
        this.setupEventHandlers();
    }

    private setupEventHandlers(): void {
        this.io.engine.on("connection_error", (err) => {
            logger.error("Connection error", {
                component: 'GameServer',
                error: toErrorWithStack(err)
            });
        });

        this.io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
            // Log all incoming messages
            socket.onAny((eventName, ...args) => {
                logger.websocket.message('in', eventName, args[0], socket.id);
            });

            // Wrap emit for logging
            const originalEmit = socket.emit;
            const wrappedEmit = function<Ev extends WebSocketEvent>(
                this: typeof socket,
                ev: Ev,
                ...args: Parameters<typeof socket.emit<Ev>>
            ): ReturnType<typeof socket.emit<Ev>> {
                logger.websocket.message('out', ev, args[0], socket.id);
                return originalEmit.apply(this, [ev, ...args]);
            };
            socket.emit = wrappedEmit;

            // Wrap room emit for logging
            const originalTo = this.io.to;
            this.io.to = (room: string) => {
                const result = originalTo.call(this.io, room);
                const originalRoomEmit = result.emit;
                result.emit = function<Ev extends WebSocketEvent>(
                    this: typeof result,
                    ev: Ev,
                    ...args: Parameters<typeof result.emit<Ev>>
                ): ReturnType<typeof result.emit<Ev>> {
                    logger.websocket.message('out', ev, args[0], `room:${room}`);
                    return originalRoomEmit.apply(this, [ev, ...args]);
                };
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

                    const event = await this.eventService.createGameCreatedEvent(gameId, GameStatus.WAITING);
                    if (!validateGameEvent(event)) {
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
                        gameId,
                        code: game.code,
                        eventId: event.id,
                        status: event.data.status
                    });

                } catch (err) {
                    const error = err as Error;
                    logger.error('Error creating game', {
                        component: 'GameServer',
                        context: { playerId: socket.id },
                        error: toErrorWithStack(error)
                    });
                    socket.emit('error', {
                        code: WebSocketErrorCode.InternalError,
                        message: 'Failed to create game',
                        details: { error: error.message }
                    });
                }
            });

            socket.on('join_game', async ({ gameId, code }: { gameId?: string; code?: string }) => {
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

                } catch (err) {
                    const error = err as Error;
                    logger.error('Error joining game', {
                        component: 'GameServer',
                        context: { 
                            playerId: socket.id,
                            gameId,
                            code 
                        },
                        error: toErrorWithStack(error)
                    });
                    socket.emit('error', {
                        code: WebSocketErrorCode.InternalError,
                        message: 'Failed to join game',
                        details: { error: error.message }
                    });
                }
            });