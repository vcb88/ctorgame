import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { Socket } from 'socket.io';
import { 
  IPlayer, 
  IMove, 
  IGameRoom, 
  WebSocketEvents,
  ServerToClientEvents,
  ClientToServerEvents
} from '../../../shared/types';
import { GameService } from '../services/GameService';
import { AppDataSource } from '../config/database';

export class GameServer {
  private io: Server<ClientToServerEvents, ServerToClientEvents>;
  private gameService: GameService;
  private activeGames: Map<string, IGameRoom> = new Map(); // Временное хранение активных игр

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

          // Сохраняем игру в БД
          const game = await this.gameService.createGame(gameCode, player);

          // Создаем активную игру в памяти
          const activeGame: IGameRoom = {
            gameId: gameCode,
            players: [player],
            currentState: game.currentState,
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

          if (!this.isValidMove(activeGame.currentState.board, move)) {
            socket.emit(WebSocketEvents.Error, { message: 'Invalid move' });
            return;
          }

          // Сохраняем ход в БД
          const updatedGame = await this.gameService.makeMove(gameId, player.number, move);
          
          // Обновляем состояние в памяти
          activeGame.currentState = updatedGame.currentState;
          activeGame.currentPlayer = (activeGame.currentPlayer + 1) % 2;

          this.io.to(gameId).emit(WebSocketEvents.GameStateUpdated, {
            gameState: activeGame.currentState,
            currentPlayer: activeGame.currentPlayer
          });

          // Если игра завершена, отправляем дополнительное событие
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

      socket.on(WebSocketEvents.Disconnect, () => {
        for (const [gameId, game] of this.activeGames.entries()) {
          const playerIndex = game.players.findIndex(p => p.id === socket.id);
          if (playerIndex !== -1) {
            this.io.to(gameId).emit(WebSocketEvents.PlayerDisconnected, {
              player: playerIndex
            });
            
            // Оставляем игру в памяти на случай переподключения игрока
            // Можно добавить таймер для удаления игры через определенное время
            setTimeout(() => {
              const game = this.activeGames.get(gameId);
              if (game && game.players.find(p => p.id === socket.id)) {
                this.activeGames.delete(gameId);
              }
            }, 5 * 60 * 1000); // 5 минут на переподключение
            
            break;
          }
        }
      });
    });
  }

  private isValidMove(board: (number | null)[][], move: IMove): boolean {
    return board[move.row][move.col] === null;
  }
}