import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { Socket } from 'socket.io';
import {
  IPlayer,
  GameMove,
  OperationType,
  WebSocketEvents,
  ServerToClientEventType,
  ServerToClientEvents,
  ClientToServerEvents,
  IGameState,
  IBoard,
  BOARD_SIZE,
  MAX_PLACE_OPERATIONS,
  IScores,
  Player,
  GameOutcome,
  getOpponent,
  isValidScores,
  GamePhase,
  WebSocketPayloads
} from '@ctor-game/shared';
import { validateGameMove, validateGameState } from '../validation/game.js';
import { GameService } from '../services/GameService.js';
import { GameLogicService } from '../services/GameLogicService.js';
import { GameStorageService } from '../services/GameStorageService.js';
import { redisService } from '../services/RedisService.js';
import { redisClient, connectRedis } from '../config/redis.js';
import { GameEventResponse } from '../types/events.js';
import { WebSocketErrorCode, ErrorResponse } from '../types/connection.js';
import { logger } from '../utils/logger.js';
import { ErrorWithStack, toErrorWithStack } from '../types/error.js';

const PLAYER_RECONNECT_TIMEOUT = 5 * 60 * 1000; // 5 минут

export class GameServer {
  private io: Server<ClientToServerEvents, ServerToClientEvents>;
  private gameService: GameService;
  private storageService: GameStorageService;

  private static instance: GameServer | null = null;

  // Статический метод для получения экземпляра
  public static getInstance(httpServer: HttpServer): GameServer {
    if (!GameServer.instance) {
      logger.info("Creating new GameServer instance", { component: 'GameServer' });
      GameServer.instance = new GameServer(httpServer);
    } else {
      logger.info("Returning existing GameServer instance", { component: 'GameServer' });
    }
    return GameServer.instance;
  }

  // Приватный конструктор, чтобы предотвратить создание экземпляров через new
  private constructor(httpServer: HttpServer) {
    // Очищаем предыдущие экземпляры Socket.IO
    if ((global as any).io) {
      logger.info("Cleaning up previous Socket.IO instance", { component: 'GameServer' });
      (global as any).io.close();
    }

    this.io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      },
      path: '/socket.io/',
      // Используем только WebSocket для предотвращения двойных подключений
      transports: ['websocket'],
      serveClient: false,
      pingTimeout: 10000,
      pingInterval: 5000,
      upgradeTimeout: 10000,
      maxHttpBufferSize: 1e6,
    });

    // Сохраняем экземпляры для последующего использования
    (global as any).io = this.io;
    GameServer.instance = this;

    // Инициализируем сервисы
    this.initializeServices().catch(error => {
      logger.error("Critical initialization error", {
        component: 'GameServer',
        error: toErrorWithStack(error)
      });
      process.exit(1);
    });
  }

  private async initializeServices(): Promise<void> {
    try {
      logger.info("Starting services initialization...", { component: 'GameServer' });
      
      // Ждем подключения Redis
      await connectRedis();
      logger.info("Redis initialized", { component: 'GameServer' });

      // Инициализируем сервисы
      this.gameService = new GameService();
      this.storageService = new GameStorageService(
        process.env.MONGODB_URL,
        redisClient
      );

      // Настраиваем обработчики событий
      this.setupEventHandlers();
      logger.info("WebSocket event handlers initialized", { component: 'GameServer' });
    } catch (error) {
      logger.error("Failed to initialize services", {
        component: 'GameServer',
        error: toErrorWithStack(error)
      });
      throw error;
    }
  }

  private setupEventHandlers(): void {
    // Добавляем общий обработчик для всех исходящих сообщений
    this.io.engine.on("connection_error", (err) => {
      logger.error("Connection error", {
        component: 'GameServer',
        context: { error: toErrorWithStack(err) }
      });
    });

    this.io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
      // Логируем все входящие сообщения
      socket.onAny((eventName, ...args) => {
        logger.websocket.message('in', eventName, args[0], socket.id);
      });

      // Оборачиваем emit для логирования
      const originalEmit = socket.emit;
      const wrappedEmit = function<Ev extends ServerToClientEventType>(
        this: typeof socket,
        ev: Ev,
        ...args: Parameters<typeof socket.emit<Ev>>
      ): ReturnType<typeof socket.emit<Ev>> {
        logger.websocket.message('out', ev, args[0], socket.id);
        return originalEmit.apply(this, [ev, ...args]);
      };
      socket.emit = wrappedEmit;

      // Оборачиваем room emit для логирования
      const originalTo = this.io.to;
      this.io.to = (room: string) => {
        const result = originalTo.call(this.io, room);
        const originalRoomEmit = result.emit;
        result.emit = function<Ev extends WebSocketEvents>(
          this: typeof result,
          ev: Ev,
          ...args: Parameters<typeof result.emit<Ev>>
        ): ReturnType<typeof result.emit<Ev>> {
          logger.websocket.message('out', ev, args[0], `room:${room}`);
          return originalRoomEmit.apply(this, [ev, ...args]);
        };
        return result;
      };

      // Добавляем расширенное логирование подключений
      logger.info('New client connection', {
        component: 'GameServer',
        context: {
          socketId: socket.id,
          transport: socket.conn.transport.name,
          remoteAddress: socket.handshake.address,
          userAgent: socket.handshake.headers['user-agent']
        }
      });

      socket.on(WebSocketEvents.CreateGame, async () => {
        try {
          // Генерируем 6 символов в верхнем регистре
          const gameCode = Math.random().toString(36).substring(2, 8).toUpperCase();
          const player: IPlayer = {
            id: socket.id,
            number: Player.First
          };

          // Создаем начальное состояние игры
          const initialState = GameLogicService.createInitialState();

          // Сохраняем игру в БД и Redis
          await Promise.all([
            this.gameService.createGame(gameCode, player, initialState),
            redisService.createGame(gameCode, player, initialState)
          ]);

          // Проверяем успешность создания игры
          await socket.join(gameCode);
          const gameRoom = await redisService.getGameRoom(gameCode);

          if (!gameRoom) {
            throw new Error('Failed to create game room');
          }

          logger.info('Game created', {
            component: 'GameServer',
            context: {
              gameId: gameCode,
              playerId: socket.id
            }
          });
          
          // Сохраняем сессию игрока
          await redisService.setPlayerSession(socket.id, gameCode, Player.First);
          logger.info('Player session saved', {
            component: 'GameServer',
            context: {
              playerId: socket.id,
              gameId: gameCode
            }
          });

          socket.emit(WebSocketEvents.GameCreated, { 
            gameId: gameCode,
            eventId: Date.now().toString()
          });
          logger.info('GameCreated event sent', {
            component: 'GameServer',
            context: {
              playerId: socket.id,
              gameId: gameCode
            }
          });
        } catch (err) {
          const error = err as Error;
          logger.error('Error creating game', {
            component: 'GameServer',
            context: { playerId: socket.id },
            error: toErrorWithStack(error)
          });
          socket.emit(WebSocketEvents.Error, { 
            code: WebSocketErrorCode.SERVER_ERROR,
            message: 'Failed to create game',
            details: { error: error.message }
          });
        }
      });

      socket.on(WebSocketEvents.JoinGame, async ({ gameId }) => {
        try {
          const room = await redisService.getGameRoom(gameId);
          if (!room) {
            socket.emit(WebSocketEvents.Error, { code: WebSocketErrorCode.INVALID_GAME_ID, message: 'Game not found' });
            return;
          }

          if (room.players.length >= 2) {
            socket.emit(WebSocketEvents.Error, { code: WebSocketErrorCode.SERVER_ERROR, message: 'Game is full' });
            return;
          }

          const player: IPlayer = {
            id: socket.id,
            number: Player.Second
          };

          // Сохраняем игрока в БД и Redis
          await Promise.all([
            this.gameService.joinGame(gameId, player),
            redisService.joinGame(gameId, player)
          ]);

          socket.join(gameId);

          // Получаем актуальное состояние игры
          const gameState = await redisService.getGameState(gameId);
          if (!gameState) {
            socket.emit(WebSocketEvents.Error, { code: WebSocketErrorCode.INVALID_STATE, message: 'Game state not found' });
            return;
          }

          logger.info('Player joined game', {
            component: 'GameServer',
            context: {
              playerId: socket.id,
              gameId: gameId
            }
          });

          // Сначала отправляем подтверждение присоединения
          socket.emit(WebSocketEvents.GameJoined, { 
            gameId,
            eventId: Date.now().toString(),
            phase: GamePhase.CONNECTING
          });
          logger.info('GameJoined event sent', {
            component: 'GameServer',
            context: {
              playerId: socket.id,
              gameId: gameId
            }
          });

          // Потом отправляем всем участникам информацию о начале игры
          const currentPlayer = redisService.getCurrentPlayer(gameState);
          this.io.to(gameId).emit(WebSocketEvents.GameStarted, {
            gameState,
            currentPlayer,
            eventId: Date.now().toString(),
            phase: GamePhase.PLAYING
          });
          logger.info('GameStarted event sent', {
            component: 'GameServer',
            context: {
              gameId: gameId,
              currentPlayer: currentPlayer,
              phase: GamePhase.PLAYING
            }
          });
        } catch (err) {
          const error = err as Error;
          logger.error('Error joining game', {
            component: 'GameServer',
            context: {
              playerId: socket.id,
              gameId: gameId
            },
            error: toErrorWithStack(error)
          });
          socket.emit(WebSocketEvents.Error, { code: WebSocketErrorCode.SERVER_ERROR, message: 'Failed to join game' });
        }
      });

      socket.on(WebSocketEvents.MakeMove, async ({ gameId, move }) => {
        try {
          const [room, state] = await Promise.all([
            redisService.getGameRoom(gameId),
            redisService.getGameState(gameId)
          ]);

          if (!room || !state) {
            socket.emit(WebSocketEvents.Error, { code: WebSocketErrorCode.INVALID_GAME_ID, message: 'Game not found' });
            return;
          }

          const player = room.players.find((p: IPlayer) => p.id === socket.id);
          if (!player) {
            socket.emit(WebSocketEvents.Error, { code: WebSocketErrorCode.SERVER_ERROR, message: 'Player not found in game' });
            return;
          }

          const session = await redisService.getPlayerSession(socket.id);
          if (!session || session.gameId !== gameId) {
            socket.emit(WebSocketEvents.Error, { code: WebSocketErrorCode.SERVER_ERROR, message: 'Invalid player session' });
            return;
          }

          const currentPlayer = redisService.getCurrentPlayer(state);
          if (player.number !== currentPlayer) {
            socket.emit(WebSocketEvents.Error, { code: WebSocketErrorCode.NOT_YOUR_TURN, message: 'Not your turn' });
            return;
          }

          if (state.gameOver) {
            socket.emit(WebSocketEvents.Error, { code: WebSocketErrorCode.GAME_ENDED, message: 'Game is over' });
            return;
          }

          // Проверяем и применяем ход
          const updatedState = await redisService.updateGameState(
            gameId,
            player.number,
            move
          );

          // Сохраняем ход в БД
          await this.gameService.makeMove(gameId, player.number, move);

          const nextPlayer = redisService.getCurrentPlayer(updatedState);
          // Отправляем обновленное состояние всем игрокам
          this.io.to(gameId).emit(WebSocketEvents.GameStateUpdated, {
            gameState: updatedState,
            currentPlayer: nextPlayer,
            phase: updatedState.gameOver ? GamePhase.FINISHED : GamePhase.PLAYING
          });

          // Проверяем доступные замены для операции размещения
          if (move.type === OperationType.PLACE) {
            const availableReplaces = GameLogicService.getAvailableReplaces(
              updatedState,
              player.number
            );

            if (availableReplaces.length > 0) {
              socket.emit(WebSocketEvents.AvailableReplaces, {
                moves: availableReplaces,
                replacements: availableReplaces.map(move => [move.position.x, move.position.y])
              });
            }
          }

          // Обрабатываем завершение игры
          if (updatedState.gameOver) {
            await Promise.all([
              redisService.cleanupGame(gameId),
              this.gameService.finishGame(gameId, updatedState.winner, updatedState.scores)
            ]);

            this.io.to(gameId).emit(WebSocketEvents.GameOver, {
              gameState: updatedState,
              winner: updatedState.winner
            });
          }
        } catch (err) {
          const error = err as Error;
          logger.error('Error making move', {
            component: 'GameServer',
            context: {
              playerId: socket.id,
              gameId: gameId,
              move: move
            },
            error: toErrorWithStack(error)
          });
          socket.emit(WebSocketEvents.Error, { code: WebSocketErrorCode.SERVER_ERROR, message: 'Failed to make move' });
        }
      });

      socket.on(WebSocketEvents.EndTurn, async ({ gameId }) => {
        try {
          const [room, state] = await Promise.all([
            redisService.getGameRoom(gameId),
            redisService.getGameState(gameId)
          ]);

          if (!room || !state) {
            socket.emit(WebSocketEvents.Error, { code: WebSocketErrorCode.INVALID_GAME_ID, message: 'Game not found' });
            return;
          }

          const player = room.players.find((p: IPlayer) => p.id === socket.id);
          if (!player) {
            socket.emit(WebSocketEvents.Error, { code: WebSocketErrorCode.SERVER_ERROR, message: 'Player not found in game' });
            return;
          }

          const currentPlayer = redisService.getCurrentPlayer(state);
          if (player.number !== currentPlayer) {
            socket.emit(WebSocketEvents.Error, { code: WebSocketErrorCode.NOT_YOUR_TURN, message: 'Not your turn' });
            return;
          }

          // Обновляем состояние для следующего хода
          const updatedState: IGameState = {
            ...state,
            currentTurn: {
              placeOperationsLeft: MAX_PLACE_OPERATIONS,
              replaceOperationsLeft: 0,
              moves: []
            }
          };

          await redisService.setGameState(gameId, updatedState);
          await this.gameService.makeMove(gameId, player.number, {
            type: OperationType.END_TURN,
            position: { x: -1, y: -1 }
          });

          const nextPlayer = redisService.getCurrentPlayer(updatedState);
          // Отправляем обновленное состояние всем игрокам
          this.io.to(gameId).emit(WebSocketEvents.GameStateUpdated, {
            gameState: updatedState,
            currentPlayer: nextPlayer,
            phase: GamePhase.PLAYING
          });
        } catch (err) {
          const error = err as Error;
          logger.error('Error ending turn', {
            component: 'GameServer',
            context: {
              playerId: socket.id,
              gameId: gameId
            },
            error: toErrorWithStack(error)
          });
          socket.emit(WebSocketEvents.Error, { code: WebSocketErrorCode.SERVER_ERROR, message: 'Failed to end turn' });
        }
      });

      socket.on(WebSocketEvents.Disconnect, async () => {
        try {
          const session = await redisService.getPlayerSession(socket.id);
          if (session) {
            // Уведомляем других игроков об отключении
            this.io.to(session.gameId).emit(WebSocketEvents.PlayerDisconnected, {
              player: session.playerNumber
            });

            // Запускаем таймер на удаление игры
            setTimeout(async () => {
              try {
                // Проверяем, не переподключился ли игрок
                const currentSession = await redisService.getPlayerSession(socket.id);
                if (currentSession && currentSession.gameId === session.gameId) {
                  // Если игрок не переподключился - завершаем игру
                  await Promise.all([
                    // При дисконнекте противник побеждает, счет 0:0
                    this.gameService.finishGame(session.gameId, getOpponent(session.playerNumber), {
                      [Player.First]: 0,
                      [Player.Second]: 0
                    } as IScores),
                    redisService.cleanupGame(session.gameId)
                  ]);

                  // Уведомляем оставшихся игроков
                  this.io.to(session.gameId).emit(WebSocketEvents.GameExpired, {
                    gameId: session.gameId,
                    reason: 'Player disconnection timeout'
                  });
                }
              } catch (err) {
          const error = err as Error;
                logger.error('Error handling disconnection timeout', {
                  component: 'GameServer',
                  context: {
                    playerId: socket.id,
                    gameId: session.gameId
                  },
                  error: toErrorWithStack(error)
                });
              }
            }, PLAYER_RECONNECT_TIMEOUT);
          }
        } catch (err) {
          const error = err as Error;
          logger.error('Error handling disconnect', {
            component: 'GameServer',
            context: { playerId: socket.id },
            error: toErrorWithStack(error)
          });
        }
      });

      socket.on(WebSocketEvents.Reconnect, async ({ gameId }) => {
        try {
          const [room, state] = await Promise.all([
            redisService.getGameRoom(gameId),
            redisService.getGameState(gameId)
          ]);

          if (!room || !state) {
            socket.emit(WebSocketEvents.Error, { 
              code: WebSocketErrorCode.INVALID_GAME_ID,
              message: 'Game not found or expired' 
            });
            return;
          }

          const player = room.players.find((p: IPlayer) => p.id === socket.id);
          if (!player) {
            socket.emit(WebSocketEvents.Error, {
              code: WebSocketErrorCode.SERVER_ERROR,
              message: 'Player not found in this game'
            });
            return;
          }

          // Обновляем сессию игрока
          await redisService.setPlayerSession(socket.id, gameId, player.number);

          // Присоединяем к комнате игры
          socket.join(gameId);

          const currentPlayer = redisService.getCurrentPlayer(state);
          // Отправляем текущее состояние игры
          socket.emit(WebSocketEvents.PlayerReconnected, {
            gameState: state,
            currentPlayer,
            player: player.number
          });

          // Уведомляем других игроков
          socket.to(gameId).emit(WebSocketEvents.PlayerReconnected, {
            gameState: state,
            currentPlayer,
            player: player.number
          });
        } catch (err) {
          const error = err as Error;
          logger.error('Error reconnecting', {
            component: 'GameServer',
            context: {
              playerId: socket.id,
              gameId: gameId
            },
            error: toErrorWithStack(error)
          });
          socket.emit(WebSocketEvents.Error, {
            code: WebSocketErrorCode.CONNECTION_ERROR,
            message: 'Failed to reconnect',
            details: { error: error.message }
          });
        }
      });
    });
  }
}