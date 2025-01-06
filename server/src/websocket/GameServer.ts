import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { Socket } from 'socket.io';
import { 
  IPlayer,
  IGameMove,
  OperationType,
  WebSocketEvents,
  ServerToClientEvents,
  ClientToServerEvents
} from '@ctor-game/shared/types';
import { GameService } from '../services/GameService';
import { GameLogicService } from '../services/GameLogicService';
import { AppDataSource } from '../config/database';
import { redisService } from '../services/RedisService';
import { connectRedis } from '../config/redis';

const PLAYER_RECONNECT_TIMEOUT = 5 * 60 * 1000; // 5 минут

export class GameServer {
  private io: Server<ClientToServerEvents, ServerToClientEvents>;
  private gameService: GameService;

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    // Инициализируем базу данных и сервисы
    Promise.all([
      AppDataSource.initialize(),
      connectRedis()
    ]).then(() => {
      console.log("Database and Redis initialized");
      this.gameService = new GameService();
      this.setupEventHandlers();
    }).catch(error => console.error("Initialization error:", error));
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
      console.log(`Client connected: ${socket.id}`);

      socket.on(WebSocketEvents.CreateGame, async () => {
        try {
          const gameCode = Math.random().toString(36).substring(7);
          const player: IPlayer = {
            id: socket.id,
            number: 0
          };

          // Создаем начальное состояние игры
          const initialState = GameLogicService.createInitialState();

          // Сохраняем игру в БД и Redis
          await Promise.all([
            this.gameService.createGame(gameCode, player, initialState),
            redisService.createGame(gameCode, player, initialState)
          ]);

          socket.join(gameCode);
          socket.emit(WebSocketEvents.GameCreated, { gameId: gameCode });
        } catch (error) {
          console.error('Error creating game:', error);
          socket.emit(WebSocketEvents.Error, { message: 'Failed to create game' });
        }
      });

      socket.on(WebSocketEvents.JoinGame, async ({ gameId }) => {
        try {
          const room = await redisService.getGameRoom(gameId);
          if (!room) {
            socket.emit(WebSocketEvents.Error, { message: 'Game not found' });
            return;
          }

          if (room.players.length >= 2) {
            socket.emit(WebSocketEvents.Error, { message: 'Game is full' });
            return;
          }

          const player: IPlayer = {
            id: socket.id,
            number: 1
          };

          // Сохраняем игрока в БД и Redis
          await Promise.all([
            this.gameService.joinGame(gameId, player),
            redisService.joinGame(gameId, player)
          ]);

          socket.join(gameId);

          // Получаем актуальное состояние игры
          const gameState = await redisService.getGameState(gameId);

          this.io.to(gameId).emit(WebSocketEvents.GameStarted, {
            gameState: gameState,
            currentPlayer: 0 // Первый ход всегда за первым игроком
          });
        } catch (error) {
          console.error('Error joining game:', error);
          socket.emit(WebSocketEvents.Error, { message: 'Failed to join game' });
        }
      });

      socket.on(WebSocketEvents.MakeMove, async ({ gameId, move }) => {
        try {
          const [room, state] = await Promise.all([
            redisService.getGameRoom(gameId),
            redisService.getGameState(gameId)
          ]);

          if (!room || !state) {
            socket.emit(WebSocketEvents.Error, { message: 'Game not found' });
            return;
          }

          const player = room.players.find(p => p.id === socket.id);
          if (!player) {
            socket.emit(WebSocketEvents.Error, { message: 'Player not found in game' });
            return;
          }

          const session = await redisService.getPlayerSession(socket.id);
          if (!session || session.gameId !== gameId) {
            socket.emit(WebSocketEvents.Error, { message: 'Invalid player session' });
            return;
          }

          if (player.number !== state.currentPlayer) {
            socket.emit(WebSocketEvents.Error, { message: 'Not your turn' });
            return;
          }

          if (state.gameOver) {
            socket.emit(WebSocketEvents.Error, { message: 'Game is over' });
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

          // Отправляем обновленное состояние всем игрокам
          this.io.to(gameId).emit(WebSocketEvents.GameStateUpdated, {
            gameState: updatedState,
            currentPlayer: updatedState.currentPlayer
          });

          // Проверяем доступные замены для операции размещения
          if (move.type === OperationType.PLACE) {
            const availableReplaces = GameLogicService.getAvailableReplaces(
              updatedState,
              player.number
            );

            if (availableReplaces.length > 0) {
              socket.emit(WebSocketEvents.AvailableReplaces, {
                moves: availableReplaces
              });
            }
          }

          // Обрабатываем завершение игры
          if (updatedState.gameOver) {
            await Promise.all([
              redisService.cleanupGame(gameId),
              this.gameService.finishGame(gameId, {
                winner: updatedState.winner,
                reason: 'Game completed'
              })
            ]);

            this.io.to(gameId).emit(WebSocketEvents.GameOver, {
              gameState: updatedState,
              winner: updatedState.winner
            });
          }
        } catch (error) {
          console.error('Error making move:', error);
          socket.emit(WebSocketEvents.Error, { message: 'Failed to make move' });
        }
      });

      socket.on(WebSocketEvents.EndTurn, async ({ gameId }) => {
        try {
          const [room, state] = await Promise.all([
            redisService.getGameRoom(gameId),
            redisService.getGameState(gameId)
          ]);

          if (!room || !state) {
            socket.emit(WebSocketEvents.Error, { message: 'Game not found' });
            return;
          }

          const player = room.players.find(p => p.id === socket.id);
          if (!player) {
            socket.emit(WebSocketEvents.Error, { message: 'Player not found in game' });
            return;
          }

          if (player.number !== state.currentPlayer) {
            socket.emit(WebSocketEvents.Error, { message: 'Not your turn' });
            return;
          }

          // Обновляем состояние для следующего хода
          const updatedState = await redisService.updateGameState(gameId, (state) => ({
            ...state,
            currentTurn: {
              placeOperationsLeft: 2,
              moves: []
            },
            currentPlayer: (state.currentPlayer + 1) % 2
          }));

          // Сохраняем состояние в БД
          await this.gameService.updateGameState(gameId, updatedState);

          // Отправляем обновленное состояние всем игрокам
          this.io.to(gameId).emit(WebSocketEvents.GameStateUpdated, {
            gameState: updatedState,
            currentPlayer: updatedState.currentPlayer
          });
        } catch (error) {
          console.error('Error ending turn:', error);
          socket.emit(WebSocketEvents.Error, { message: 'Failed to end turn' });
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
                    this.gameService.finishGame(session.gameId, {
                      winner: 1 - session.playerNumber,
                      reason: 'Player disconnected'
                    }),
                    redisService.cleanupGame(session.gameId)
                  ]);

                  // Уведомляем оставшихся игроков
                  this.io.to(session.gameId).emit(WebSocketEvents.GameExpired, {
                    gameId: session.gameId,
                    reason: 'Player disconnection timeout'
                  });
                }
              } catch (error) {
                console.error('Error handling disconnection timeout:', error);
              }
            }, PLAYER_RECONNECT_TIMEOUT);
          }
        } catch (error) {
          console.error('Error handling disconnect:', error);
        }
      });

      socket.on(WebSocketEvents.Reconnect, async ({ gameId }) => {
        try {
          const [room, state] = await Promise.all([
            redisService.getGameRoom(gameId),
            redisService.getGameState(gameId)
          ]);

          if (!room || !state) {
            socket.emit(WebSocketEvents.Error, { message: 'Game not found or expired' });
            return;
          }

          const player = room.players.find(p => p.id === socket.id);
          if (!player) {
            socket.emit(WebSocketEvents.Error, { message: 'Player not found in this game' });
            return;
          }

          // Обновляем сессию игрока
          await redisService.setPlayerSession(socket.id, gameId, player.number);

          // Присоединяем к комнате игры
          socket.join(gameId);

          // Отправляем текущее состояние игры
          socket.emit(WebSocketEvents.PlayerReconnected, {
            gameState: state,
            currentPlayer: state.currentPlayer,
            playerNumber: player.number
          });

          // Уведомляем других игроков
          socket.to(gameId).emit(WebSocketEvents.PlayerReconnected, {
            gameState: state,
            currentPlayer: state.currentPlayer,
            playerNumber: player.number
          });
        } catch (error) {
          console.error('Error reconnecting:', error);
          socket.emit(WebSocketEvents.Error, { message: 'Failed to reconnect' });
        }
      });
    });
  }
}