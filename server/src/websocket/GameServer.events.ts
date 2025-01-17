import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import type {
    WebSocketEvent,
    ServerToClientEvents,
    ClientToServerEvents,
    GameState,
    GameMove,
    PlayerNumber,
    GameStatus,
    Position,
    NetworkError,
    WebSocketErrorCode,
    InterServerEvents,
    SocketData,
    WebSocketServerConfig,
    WebSocketServerOptions
} from '@ctor-game/shared/types/core.js';
import { validateEvent } from '@ctor-game/shared/utils/events.js';
import { 
    GameError, 
    GameNotFoundError, 
    NotYourTurnError, 
    GameEndedError,
    InvalidStateError,
    ServerError
} from '../errors/GameError.js';
import { ErrorHandlingService } from '../services/ErrorHandlingService.js';

// Define socket types using imported interfaces
type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
type GameServerType = SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

// Services
import { RedisService } from '../services/RedisService.js';
const redisService = new RedisService();
import { GameService } from '../services/GameService.js';
import { GameLogicService } from '../services/GameLogicService.js';
import { EventService } from '../services/EventService.js';
import type { GameEventService } from '@ctor-game/shared/types/base/types.js';
import { logger } from '../utils/logger.js';

const DEFAULT_CONFIG: WebSocketServerConfig = {
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
    private eventService: GameEventService;
    private errorHandlingService: ErrorHandlingService;
    private reconnectTimeout: number;

    public static getInstance(httpServer: HttpServer, options: WebSocketServerOptions = {}): GameServer {
        if (!GameServer.instance) {
            GameServer.instance = new GameServer(httpServer, options);
        }
        return GameServer.instance;
    }

    private constructor(httpServer: HttpServer, options: WebSocketServerOptions) {
        if ((global as any).io) {
            (global as any).io.close();
        }

        const config = { ...DEFAULT_CONFIG, ...options.config };
        this.reconnectTimeout = options.reconnectTimeout ?? DEFAULT_RECONNECT_TIMEOUT;

        this.io = new SocketIOServer(httpServer, {
            ...config,
            transports: ['websocket'] as any // Type assertion for compatibility
        });
        this.gameService = new GameService(options.storageService, options.eventService, options.redisService);
        this.eventService = options.eventService || new EventService(redisService) as unknown as GameEventService;
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

        socket.on('create_game', async () => await this.handleCreateGame(socket));
        socket.on('join_game', async (gameId: string) => await this.handleJoinGame(socket, { gameId }));
        socket.on('make_move', async (move: GameMove) => {
            const gameId = socket.data.gameId;
            if (!gameId) {
                await this.handleError(socket, new Error('No game ID found'));
                return;
            }
            await this.handleMakeMove(socket, { gameId, move });
        });
        socket.on('end_turn', async (data: { gameId: string }) => {
            if (!data || !data.gameId) {
                await this.handleError(socket, new Error('No game ID provided'));
                return;
            }
            await this.handleEndTurn(socket, { gameId: data.gameId });
        });
        socket.on('disconnect', () => this.handleDisconnect(socket));
    }

    private async handleCreateGame(socket: GameSocket): Promise<void> {
        try {
            const gameId = crypto.randomUUID();
            const game = await this.gameService.createGame(socket.id, gameId);
            await socket.join(gameId);

            const event = await this.eventService.createGameCreatedEvent(gameId, 'waiting');
            if (!validateEvent(event)) {
                throw new ServerError('Invalid game created event');
            }

            // Make sure we have valid event data
            if (!event.data?.status) {
                throw new ServerError('Invalid game created event: missing status');
            }

            socket.emit('game_created', {
                gameId,
                eventId: event.id,
                code: game.code,
                status: event.data.status,
                timestamp: Date.now(),
                type: 'game_created'
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
                throw new GameNotFoundError('Either gameId or code must be provided');
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

            if (!targetGameId) {
                throw new GameNotFoundError('Game ID not found');
            }

            const game = await this.gameService.joinGame(targetGameId, socket.id);
            await socket.join(targetGameId);

            // Get state after join
            const state = await redisService.getGameState(targetGameId);
            if (!state) {
                throw new Error('Game state not found');
            }

            // Emit player connected event
            const connectEvent = await this.eventService.createPlayerConnectedEvent(
                targetGameId,
                socket.id,
                2 as PlayerNumber
            );

            if (!validateEvent(connectEvent)) {
                throw new ServerError('Invalid player connected event');
            }

            socket.emit('game_joined', {
                gameId: targetGameId,
                eventId: connectEvent.id,
                status: game.status,
                timestamp: Date.now(),
                type: 'game_joined'
            });

            // If game is now ready to start
            if (game.players[0] && game.players[1]) {
                const startEvent = await this.eventService.createGameStartedEvent(targetGameId, state);
                if (!validateEvent(startEvent)) {
                    throw new ServerError('Invalid game started event');
                }

                this.io.to(targetGameId).emit('game_started', {
                    gameId: targetGameId,
                    eventId: startEvent.id,
                    gameState: state,
                    currentPlayer: state.currentPlayer,
                    timestamp: Date.now(),
                    type: 'game_started'
                });
            }

        } catch (error) {
            await this.handleError(socket, error as Error);
        }
    }

    private async handleMakeMove(
        socket: GameSocket,
        { gameId, move }: { gameId: string; move: GameMove }
    ): Promise<void> {
        try {
            const state = await redisService.getGameState(gameId);
            if (!state) {
                throw new GameNotFoundError();
            }

            if (state.status === 'finished') {
                throw new GameEndedError();
            }

            const session = await redisService.getPlayerSession(socket.id);
            if (!session) {
                throw new InvalidStateError('Player not found in game');
            }

            if (session.playerNumber !== state.currentPlayer) {
                throw new NotYourTurnError();
            }

            // Apply move and get new state
            const updatedState = await this.gameService.makeMove(gameId, session.playerNumber, move);

            // Create and emit move event
            const moveEvent = await this.eventService.createGameMoveEvent(
                gameId,
                session.playerId,
                move,
                updatedState
            );

            if (!validateEvent(moveEvent)) {
                throw new ServerError('Invalid game move event');
            }

            this.io.to(gameId).emit('game_state_updated', updatedState);

            // Handle game over
            if (updatedState.status === 'finished') {
                const winner = updatedState.winner as PlayerNumber;
                const endEvent = await this.eventService.createGameEndedEvent(
                    gameId,
                    winner,
                    updatedState
                );

                if (!validateEvent(endEvent)) {
                    throw new ServerError('Invalid game ended event');
                }

                this.io.to(gameId).emit('game_over', {
                    winner,
                    finalState: updatedState
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

            const session = await redisService.getPlayerSession(socket.id);
            if (!session) {
                throw new InvalidStateError('Player not found in game');
            }

            if (session.playerNumber !== state.currentPlayer) {
                throw new NotYourTurnError();
            }

            // Create end turn move
            const endTurnMove: GameMove = {
                type: 'skip',
                position: [0, 0], // default position for skip move
                player: session.playerNumber,
                timestamp: Date.now()
            };

            const updatedState = await this.gameService.makeMove(gameId, session.playerNumber, endTurnMove);

            const moveEvent = await this.eventService.createGameMoveEvent(
                gameId,
                session.playerId,
                endTurnMove,
                updatedState
            );

            if (!validateEvent(moveEvent)) {
                throw new ServerError('Invalid game move event');
            }

            this.io.to(gameId).emit('turn_ended', updatedState.currentPlayer);

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

                if (!validateEvent(errorEvent)) {
                    this.errorHandlingService.logError(
                        new ServerError('Invalid error event'),
                        { socketId: socket.id, gameId: session.gameId }
                    );
                }

                socket.emit('error', {
                    ...errorResponse,
                    timestamp: Date.now()
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
                code: 'INTERNAL_ERROR' as WebSocketErrorCode,
                message: 'Internal server error',
                category: 'network',
                severity: 'error',
                stack: new Error().stack || 'No stack trace available',
                timestamp: Date.now()
            });
        }
    }
}