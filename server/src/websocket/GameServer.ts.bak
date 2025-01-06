import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { Socket } from 'socket.io';
import { 
  IPlayer,
  IGameRoom,
  IGameMove,
  OperationType,
  WebSocketEvents,
  ServerToClientEvents,
  ClientToServerEvents
} from '@ctor-game/shared/types';
import { GameService } from '../services/GameService';
import { GameLogicService } from '../services/GameLogicService';
import { AppDataSource } from '../config/database';

const GAME_EXPIRY_TIMEOUT = 30 * 60 * 1000; // 30 минут
const PLAYER_RECONNECT_TIMEOUT = 5 * 60 * 1000; // 5 минут

export class GameServer {
  private io: Server<ClientToServerEvents, ServerToClientEvents>;
  private gameService: GameService;
  private activeGames: Map<string, IGameRoom> = new Map(); // Временное хранение активных игр
  private disconnectedPlayers: Map<string, { gameId: string, playerNumber: number, disconnectTime: number }> = new Map();

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    // Инициализируем базу данных и сервис
    AppDataSource.initialize()
      .then(() => {
        console.log("Database initialized");
        this.gameService = new GameService();
        this.setupEventHandlers();
      })
      .catch(error => console.error("Database initialization error:", error));
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

          // Сохраняем игру в БД
          const game = await this.gameService.createGame(gameCode, player, initialState);

          // Создаем активную игру в памяти
          const activeGame: IGameRoom = {
            gameId: gameCode,
            players: [player],
            currentState: initialState,
            currentPlayer: 0
          };
          
          this.activeGames.set(gameCode, activeGame);
          socket.join(gameCode);
          socket.emit(WebSocketEvents.GameCreated, { gameId: gameCode });
        } catch (error) {
          console.error('Error creating game:', error);
          socket.emit(WebSocketEvents.Error, { message: 'Failed to create game' });
        }
      });

      socket.on(WebSocketEvents.JoinGame, async ({ gameId }) => {
        try {
          const activeGame = this.activeGames.get(gameId);
          if (!activeGame) {
            socket.emit(WebSocketEvents.Error, { message: 'Game not found' });
            return;
          }

          if (activeGame.players.length >= 2) {
            socket.emit(WebSocketEvents.Error, { message: 'Game is full' });
            return;
          }

          const player: IPlayer = {
            id: socket.id,
            number: 1
          };

          // Сохраняем игрока в БД
          await this.gameService.joinGame(gameId, player);

          // Обновляем активную игру в памяти
          activeGame.players.push(player);
          socket.join(gameId);

          this.io.to(gameId).emit(WebSocketEvents.GameStarted, {
            gameState: activeGame.currentState,
            currentPlayer: activeGame.currentPlayer
          });
        } catch (error) {
          console.error('Error joining game:', error);
          socket.emit(WebSocketEvents.Error, { message: 'Failed to join game' });
        }
      });

      socket.on(WebSocketEvents.MakeMove, async ({ gameId, move }) => {
        try {
          const activeGame = this.activeGames.get(gameId);
          
          if (!activeGame) {
            socket.emit(WebSocketEvents.Error, { message: 'Game not found' });
            return;
          }

          const player = activeGame.players.find(p => p.id === socket.id);
          if (!player) {
            socket.emit(WebSocketEvents.Error, { message: 'Player not found in game' });
            return;
          }

          if (player.number !== activeGame.currentPlayer) {
            socket.emit(WebSocketEvents.Error, { message: 'Not your turn' });
            return;
          }

          if (activeGame.currentState.gameOver) {
            socket.emit(WebSocketEvents.Error, { message: 'Game is over' });
            return;
          }

          // Проверяем валидность хода с помощью GameLogicService
          if (!GameLogicService.isValidMove(activeGame.currentState, move, player.number)) {
            socket.emit(WebSocketEvents.Error, { message: 'Invalid move' });
            return;
          }

          // Применяем ход
          const updatedState = GameLogicService.applyMove(
            activeGame.currentState,
            move,
            player.number
          );

          // Сохраняем ход в БД
          const updatedGame = await this.gameService.makeMove(gameId, player.number, move);
          
          // Обновляем состояние в памяти
          activeGame.currentState = updatedState;

          // Отправляем обновленное состояние всем игрокам
          this.io.to(gameId).emit(WebSocketEvents.GameStateUpdated, {
            gameState: activeGame.currentState,
            currentPlayer: activeGame.currentPlayer
          });

          // Если все операции размещения использованы, автоматически завершаем ход
          if (activeGame.currentState.currentTurn.placeOperationsLeft <= 0) {
            // Подготавливаем состояние для следующего хода
            activeGame.currentState.currentTurn = {
              placeOperationsLeft: 2, // Для всех ходов кроме первого даём 2 операции
              moves: []
            };
            activeGame.currentPlayer = (activeGame.currentPlayer + 1) % 2;
            
            // Если это был первый ход игры, снимаем флаг
            if (activeGame.currentState.isFirstTurn) {
              activeGame.currentState.isFirstTurn = false;
            }

            // Сохраняем обновленное состояние
            await this.gameService.updateGameState(gameId, activeGame.currentState);

            // Отправляем обновление состояния
            this.io.to(gameId).emit(WebSocketEvents.GameStateUpdated, {
              gameState: activeGame.currentState,
              currentPlayer: activeGame.currentPlayer
            });
          }

          // Если это была операция размещения, проверяем доступные замены
          if (move.type === OperationType.PLACE) {
            const availableReplaces = GameLogicService.getAvailableReplaces(
              activeGame.currentState,
              player.number
            );

            if (availableReplaces.length > 0) {
              socket.emit(WebSocketEvents.AvailableReplaces, {
                moves: availableReplaces
              });
            }
          }

          // Если игра завершена, отправляем событие окончания
          if (activeGame.currentState.gameOver) {
            this.io.to(gameId).emit(WebSocketEvents.GameOver, {
              gameState: activeGame.currentState,
              winner: activeGame.currentState.winner
            });
          }
        } catch (error) {
          console.error('Error making move:', error);
          socket.emit(WebSocketEvents.Error, { message: 'Failed to make move' });
        }
      });

      // Добавляем обработчик завершения хода
      socket.on(WebSocketEvents.EndTurn, async ({ gameId }) => {
        try {
          const activeGame = this.activeGames.get(gameId);
          
          if (!activeGame) {
            socket.emit(WebSocketEvents.Error, { message: 'Game not found' });
            return;
          }

          const player = activeGame.players.find(p => p.id === socket.id);
          if (!player) {
            socket.emit(WebSocketEvents.Error, { message: 'Player not found in game' });
            return;
          }

          if (player.number !== activeGame.currentPlayer) {
            socket.emit(WebSocketEvents.Error, { message: 'Not your turn' });
            return;
          }

          // Сбрасываем состояние хода и передаем ход следующему игроку
          activeGame.currentState.currentTurn = {
            placeOperationsLeft: 2,
            moves: []
          };
          activeGame.currentPlayer = (activeGame.currentPlayer + 1) % 2;

          // Сохраняем состояние в БД
          await this.gameService.updateGameState(gameId, activeGame.currentState);

          // Отправляем обновленное состояние всем игрокам
          this.io.to(gameId).emit(WebSocketEvents.GameStateUpdated, {
            gameState: activeGame.currentState,
            currentPlayer: activeGame.currentPlayer
          });

        } catch (error) {
          console.error('Error ending turn:', error);
          socket.emit(WebSocketEvents.Error, { message: 'Failed to end turn' });
        }
      });

      // Обработка переподключения игрока
      socket.on(WebSocketEvents.Reconnect, async ({ gameId }) => {
        try {
          const activeGame = this.activeGames.get(gameId);
          const disconnectedPlayer = this.disconnectedPlayers.get(socket.id);

          if (!activeGame) {
            socket.emit(WebSocketEvents.Error, { message: 'Game not found or expired' });
            return;
          }

          if (!disconnectedPlayer || disconnectedPlayer.gameId !== gameId) {
            socket.emit(WebSocketEvents.Error, { message: 'No active session found for this game' });
            return;
          }

          // Проверяем не истек ли таймаут переподключения
          if (Date.now() - disconnectedPlayer.disconnectTime > PLAYER_RECONNECT_TIMEOUT) {
            socket.emit(WebSocketEvents.GameExpired, { 
              gameId, 
              reason: 'Reconnection timeout expired' 
            });
            this.activeGames.delete(gameId);
            this.disconnectedPlayers.delete(socket.id);
            return;
          }

          // Обновляем ID сокета в списке игроков
          const player = activeGame.players[disconnectedPlayer.playerNumber];
          if (player) {
            player.id = socket.id;
          }

          // Присоединяем к комнате игры
          socket.join(gameId);

          // Удаляем из списка отключенных
          this.disconnectedPlayers.delete(socket.id);

          // Отправляем текущее состояние игры переподключившемуся игроку
          socket.emit(WebSocketEvents.PlayerReconnected, {
            gameState: activeGame.currentState,
            currentPlayer: activeGame.currentPlayer,
            playerNumber: disconnectedPlayer.playerNumber
          });

          // Уведомляем других игроков о переподключении
          socket.to(gameId).emit(WebSocketEvents.PlayerReconnected, {
            gameState: activeGame.currentState,
            currentPlayer: activeGame.currentPlayer,
            playerNumber: disconnectedPlayer.playerNumber
          });

        } catch (error) {
          console.error('Error reconnecting:', error);
          socket.emit(WebSocketEvents.Error, { message: 'Failed to reconnect' });
        }
      });

      // Обработка отключения игрока
      socket.on(WebSocketEvents.Disconnect, () => {
        for (const [gameId, game] of this.activeGames.entries()) {
          const playerIndex = game.players.findIndex(p => p.id === socket.id);
          if (playerIndex !== -1) {
            // Сохраняем информацию об отключившемся игроке
            this.disconnectedPlayers.set(socket.id, {
              gameId,
              playerNumber: playerIndex,
              disconnectTime: Date.now()
            });

            // Уведомляем других игроков об отключении
            this.io.to(gameId).emit(WebSocketEvents.PlayerDisconnected, {
              player: playerIndex
            });
            
            // Запускаем таймер на удаление игры
            setTimeout(async () => {
              try {
                const game = this.activeGames.get(gameId);
                if (game && this.disconnectedPlayers.has(socket.id)) {
                  // Если игрок не переподключился - завершаем игру
                  await this.gameService.finishGame(gameId, {
                    winner: 1 - playerIndex, // Победителем становится оставшийся игрок
                    reason: 'Player disconnected'
                  });

                  // Уведомляем оставшихся игроков
                  this.io.to(gameId).emit(WebSocketEvents.GameExpired, {
                    gameId,
                    reason: 'Player disconnection timeout'
                  });

                  // Удаляем игру и информацию об отключении
                  this.activeGames.delete(gameId);
                  this.disconnectedPlayers.delete(socket.id);
                }
              } catch (error) {
                console.error('Error handling disconnection timeout:', error);
              }
            }, PLAYER_RECONNECT_TIMEOUT);
            
            break;
          }
        }
      });
    });
  }


}