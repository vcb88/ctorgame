import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { Socket } from 'socket.io';
import { 
  IPlayer,
  IGameMove,
  OperationType,
  WebSocketEvents,
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
  isLegacyScores,
  isEnumScores,
  legacyToEnumScores
} from '../shared';
import { validateGameMove, validateGameState } from '../validation/game';
import { GameService } from '../services/GameService';
import { GameLogicService } from '../services/GameLogicService';
import { GameStorageService } from '../services/GameStorageService';
import { redisService } from '../services/RedisService';
import { redisClient, connectRedis } from '../config/redis';
import { GameEventResponse } from '../types/events';

const PLAYER_RECONNECT_TIMEOUT = 5 * 60 * 1000; // 5 минут

export class GameServer {
  private io: Server<ClientToServerEvents, ServerToClientEvents>;
  private gameService: GameService;
  private storageService: GameStorageService;

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    // Инициализируем сервисы
    Promise.all([
      connectRedis()
    ]).then(() => {
      console.log("Redis initialized");
      this.gameService = new GameService();
      this.storageService = new GameStorageService(
        process.env.MONGODB_URL,
        redisClient
      );
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
            number: Player.First
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
            socket.emit(WebSocketEvents.Error, { message: 'Game state not found' });
            return;
          }

          const currentPlayer = redisService.getCurrentPlayer(gameState);
          this.io.to(gameId).emit(WebSocketEvents.GameStarted, {
            gameState,
            currentPlayer
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

          const player = room.players.find((p: IPlayer) => p.id === socket.id);
          if (!player) {
            socket.emit(WebSocketEvents.Error, { message: 'Player not found in game' });
            return;
          }

          const session = await redisService.getPlayerSession(socket.id);
          if (!session || session.gameId !== gameId) {
            socket.emit(WebSocketEvents.Error, { message: 'Invalid player session' });
            return;
          }

          const currentPlayer = redisService.getCurrentPlayer(state);
          if (player.number !== currentPlayer) {
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

          const nextPlayer = redisService.getCurrentPlayer(updatedState);
          // Отправляем обновленное состояние всем игрокам
          this.io.to(gameId).emit(WebSocketEvents.GameStateUpdated, {
            gameState: updatedState,
            currentPlayer: nextPlayer
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
              this.gameService.finishGame(gameId, updatedState.winner, enumToLegacyScores(updatedState.scores))
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

          const player = room.players.find((p: IPlayer) => p.id === socket.id);
          if (!player) {
            socket.emit(WebSocketEvents.Error, { message: 'Player not found in game' });
            return;
          }

          const currentPlayer = redisService.getCurrentPlayer(state);
          if (player.number !== currentPlayer) {
            socket.emit(WebSocketEvents.Error, { message: 'Not your turn' });
            return;
          }

          // Обновляем состояние для следующего хода
          const updatedState: IGameState = {
            ...state,
            currentTurn: {
              placeOperationsLeft: MAX_PLACE_OPERATIONS,
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
            currentPlayer: nextPlayer
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
                    // При дисконнекте противник побеждает, счет 0:0
                    this.gameService.finishGame(session.gameId, getOpponent(session.playerNumber), { 
                      player1: 0, 
                      player2: 0 
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

          const player = room.players.find((p: IPlayer) => p.id === socket.id);
          if (!player) {
            socket.emit(WebSocketEvents.Error, { message: 'Player not found in this game' });
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
            playerNumber: player.number
          });

          // Уведомляем других игроков
          socket.to(gameId).emit(WebSocketEvents.PlayerReconnected, {
            gameState: state,
            currentPlayer,
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