import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import type {
    GameSocket,
    GameServer as GameServerType,
    GameServerConfig,
    GameServerOptions
} from './types.js';

// Import new event types
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
} from '@ctor-game/shared/src/types/network/events.new.js';

import type {
    WebSocketEvent,
    WebSocketErrorCode,
    ServerToClientEvents
} from '@ctor-game/shared/types/network/websocket.new.js';

import type {
    IGameState,
    IGameMove,
    PlayerNumber,
    UUID
} from '@ctor-game/shared/types/core/base.js';

// Services
import { redisService } from '../services/RedisService.js';
import { GameService } from '../services/GameService.new.js';
import { GameLogicService } from '../services/GameLogicService.new.js';
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
        this.gameService = new GameService();
        this.eventService = new EventService(redisService);

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
            const initialState = GameLogicService.createInitialState();

            await redisService.createGame(gameId, socket.id, initialState);
            await socket.join(gameId);

            const event = await this.eventService.createGameCreatedEvent(gameId, 'waiting');
            socket.emit('game_created', {
                gameId,
                eventId: event.id,
                status: event.data.status
            });

        } catch (error) {
            await this.handleError(socket, error as Error);
        }
    }

    private async handleJoinGame(socket: GameSocket, { gameId }: { gameId: UUID }): Promise<void> {
        try {
            const gameState = await redisService.getGameState(gameId);
            if (!gameState) {
                throw new Error('Game not found');
            }

            await redisService.joinGame(gameId, socket.id);
            await socket.join(gameId);

            // Emit player connected event
            const connectEvent = await this.eventService.createPlayerConnectedEvent(
                gameId,
                socket.id,
                2 as PlayerNumber
            );

            socket.emit('game_joined', {
                gameId,
                eventId: connectEvent.id,
                status: gameState.status
            });

            if (gameState.status === 'waiting') {
                const updatedState = await redisService.startGame(gameId);
                const startEvent = await this.eventService.createGameStartedEvent(gameId, updatedState);

                this.io.to(gameId).emit('game_started', {
                    gameId,
                    eventId: startEvent.id,
                    gameState: updatedState,
                    currentPlayer: updatedState.turn.currentPlayer
                });
            }

        } catch (error) {
            await this.handleError(socket, error as Error);
        }
    }

    private async handleMakeMove(
        socket: GameSocket,
        { gameId, move }: { gameId: UUID; move: IGameMove }
    ): Promise<void> {
        try {
            const gameState = await redisService.getGameState(gameId);
            if (!gameState) {
                throw new Error('Game not found');
            }

            if (gameState.status === 'finished') {
                throw new Error('Game is already finished');
            }

            const playerNumber = await redisService.getPlayerNumber(gameId, socket.id);
            if (!playerNumber) {
                throw new Error('Player not found in game');
            }

            if (playerNumber !== gameState.turn.currentPlayer) {
                throw new Error('Not your turn');
            }

            // Apply move
            const updatedState = await redisService.applyMove(gameId, playerNumber, move);

            // Create and emit move event
            const moveEvent = await this.eventService.createGameMoveEvent(
                gameId,
                socket.id,
                move,
                updatedState
            );

            this.io.to(gameId).emit('game_state_updated', {
                eventId: moveEvent.id,
                gameState: updatedState,
                currentPlayer: updatedState.turn.currentPlayer
            });

            // Handle game over
            if (updatedState.status === 'finished') {
                const winner = updatedState.scores.player1 > updatedState.scores.player2 ? 1 : 2;
                const endEvent = await this.eventService.createGameEndedEvent(
                    gameId,
                    winner as PlayerNumber,
                    updatedState
                );

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

    private async handleEndTurn(socket: GameSocket, { gameId }: { gameId: UUID }): Promise<void> {
        try {
            const gameState = await redisService.getGameState(gameId);
            if (!gameState) {
                throw new Error('Game not found');
            }

            const playerNumber = await redisService.getPlayerNumber(gameId, socket.id);
            if (!playerNumber) {
                throw new Error('Player not found in game');
            }

            if (playerNumber !== gameState.turn.currentPlayer) {
                throw new Error('Not your turn');
            }

            const updatedState = await redisService.endTurn(gameId);
            const moveEvent = await this.eventService.createGameMoveEvent(
                gameId,
                socket.id,
                { type: 'end_turn' },
                updatedState
            );

            this.io.to(gameId).emit('turn_ended', {
                eventId: moveEvent.id,
                gameState: updatedState,
                nextPlayer: updatedState.turn.currentPlayer
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

            this.io.to(session.gameId).emit('player_disconnected', {
                eventId: disconnectEvent.id,
                playerId: socket.id,
                playerNumber: session.playerNumber
            });

            // Start reconnection timeout
            setTimeout(async () => {
                const game = await redisService.getGame(session.gameId);
                if (!game) return;

                const player = game.players.find(p => p.id === socket.id);
                if (!player || player.connected) return;

                const expireEvent = await this.eventService.createGameExpiredEvent(session.gameId);
                this.io.to(session.gameId).emit('game_expired', {
                    eventId: expireEvent.id,
                    gameId: session.gameId
                });

                await redisService.cleanupGame(session.gameId);
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
                        code: 500,
                        message: error.message
                    },
                    socket.id
                );

                socket.emit('error', {
                    eventId: errorEvent.id,
                    code: 500,
                    message: error.message
                });
            } else {
                socket.emit('error', {
                    code: 500,
                    message: error.message
                });
            }
        } catch (err) {
            logger.error('Error creating error event', {
                component: 'GameServer',
                error: err
            });
            socket.emit('error', {
                code: 500,
                message: error.message
            });
        }
    }
}