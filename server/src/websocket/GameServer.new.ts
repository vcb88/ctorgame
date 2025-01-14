import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import type {
    GameSocket,
    GameServer as GameServerType,
    GameServerConfig,
    GameServerOptions
} from './types.js';

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
    private reconnectTimeout: number;

    public static getInstance(httpServer: HttpServer, options: GameServerOptions = {}): GameServer {
        if (!GameServer.instance) {
            GameServer.instance = new GameServer(httpServer, options);
        }
        return GameServer.instance;
    }

    private constructor(httpServer: HttpServer, options: GameServerOptions) {
        // Cleanup previous instance if exists
        if ((global as any).io) {
            (global as any).io.close();
        }

        const config = { ...DEFAULT_CONFIG, ...options.config };
        this.reconnectTimeout = options.reconnectTimeout ?? DEFAULT_RECONNECT_TIMEOUT;

        this.io = new SocketIOServer(httpServer, config);
        this.gameService = new GameService();

        // Save instance globally
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

    private createEvent<T extends WebSocketEvent>(data: Omit<T, 'eventId' | 'timestamp'>): T {
        return {
            ...data,
            eventId: crypto.randomUUID(),
            timestamp: Date.now()
        } as T;
    }

    private sendError(socket: GameSocket, code: WebSocketErrorCode, message: string, details?: unknown): void {
        socket.emit('error', { code, message, details });
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

        // Setup event handlers
        socket.on('create_game', () => this.handleCreateGame(socket));
        socket.on('join_game', (data) => this.handleJoinGame(socket, data));
        socket.on('make_move', (data) => this.handleMakeMove(socket, data));
        socket.on('end_turn', (data) => this.handleEndTurn(socket, data));
    }

    private async handleCreateGame(socket: GameSocket): Promise<void> {
        try {
            const gameId = crypto.randomUUID();
            const initialState = GameLogicService.createInitialState();

            await redisService.createGame(gameId, socket.id, initialState);
            await socket.join(gameId);

            socket.emit('game_created', this.createEvent({
                gameId
            }));

        } catch (error) {
            logger.error('Error creating game', {
                component: 'GameServer',
                context: { socketId: socket.id },
                error
            });
            this.sendError(socket, 'server_error', 'Failed to create game');
        }
    }

    private async handleJoinGame(socket: GameSocket, { gameId }: { gameId: UUID }): Promise<void> {
        try {
            const gameState = await redisService.getGameState(gameId);
            if (!gameState) {
                this.sendError(socket, 'invalid_game_id', 'Game not found');
                return;
            }

            await redisService.joinGame(gameId, socket.id);
            await socket.join(gameId);

            // Send join confirmation
            socket.emit('game_joined', this.createEvent({
                gameId,
                status: gameState.status
            }));

            // Start game if two players joined
            if (gameState.status === 'waiting') {
                const updatedState = await redisService.startGame(gameId);
                this.io.to(gameId).emit('game_started', this.createEvent({
                    gameId,
                    gameState: updatedState,
                    currentPlayer: updatedState.turn.currentPlayer
                }));
            }

        } catch (error) {
            logger.error('Error joining game', {
                component: 'GameServer',
                context: { socketId: socket.id, gameId },
                error
            });
            this.sendError(socket, 'server_error', 'Failed to join game');
        }
    }

    private async handleMakeMove(
        socket: GameSocket,
        { gameId, move }: { gameId: UUID; move: IGameMove }
    ): Promise<void> {
        try {
            const gameState = await redisService.getGameState(gameId);
            if (!gameState) {
                this.sendError(socket, 'invalid_game_id', 'Game not found');
                return;
            }

            if (gameState.status === 'finished') {
                this.sendError(socket, 'game_ended', 'Game is already finished');
                return;
            }

            const playerNumber = await redisService.getPlayerNumber(gameId, socket.id);
            if (!playerNumber) {
                this.sendError(socket, 'server_error', 'Player not found in game');
                return;
            }

            if (playerNumber !== gameState.turn.currentPlayer) {
                this.sendError(socket, 'not_your_turn', 'Not your turn');
                return;
            }

            // Apply move
            const updatedState = await redisService.applyMove(gameId, playerNumber, move);

            // Send update to all players
            this.io.to(gameId).emit('game_state_updated', this.createEvent({
                gameState: updatedState,
                currentPlayer: updatedState.turn.currentPlayer
            }));

            // Check game over
            if (updatedState.status === 'finished') {
                this.io.to(gameId).emit('game_over', this.createEvent({
                    gameState: updatedState,
                    winner: updatedState.turn.currentPlayer
                }));
            }

        } catch (error) {
            logger.error('Error making move', {
                component: 'GameServer',
                context: { socketId: socket.id, gameId, move },
                error
            });
            this.sendError(socket, 'server_error', 'Failed to make move');
        }
    }

    private async handleEndTurn(socket: GameSocket, { gameId }: { gameId: UUID }): Promise<void> {
        try {
            const gameState = await redisService.getGameState(gameId);
            if (!gameState) {
                this.sendError(socket, 'invalid_game_id', 'Game not found');
                return;
            }

            const playerNumber = await redisService.getPlayerNumber(gameId, socket.id);
            if (!playerNumber) {
                this.sendError(socket, 'server_error', 'Player not found in game');
                return;
            }

            if (playerNumber !== gameState.turn.currentPlayer) {
                this.sendError(socket, 'not_your_turn', 'Not your turn');
                return;
            }

            const updatedState = await redisService.endTurn(gameId);
            this.io.to(gameId).emit('turn_ended', this.createEvent({
                gameState: updatedState,
                nextPlayer: updatedState.turn.currentPlayer
            }));

        } catch (error) {
            logger.error('Error ending turn', {
                component: 'GameServer',
                context: { socketId: socket.id, gameId },
                error
            });
            this.sendError(socket, 'server_error', 'Failed to end turn');
        }
    }
}