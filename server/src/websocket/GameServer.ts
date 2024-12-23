import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { GameState, Player, Move, GameRoom } from '../../../shared/types';

export class GameServer {
  private io: Server;
  private games: Map<string, GameRoom> = new Map();

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`);

      socket.on('createGame', () => {
        const gameId = Math.random().toString(36).substring(7);
        const game: GameRoom = {
          gameId,
          players: [{
            id: socket.id,
            number: 0
          }],
          currentState: this.createInitialGameState(),
          currentPlayer: 0
        };
        
        this.games.set(gameId, game);
        socket.join(gameId);
        socket.emit('gameCreated', { gameId });
      });

      socket.on('joinGame', ({ gameId }) => {
        const game = this.games.get(gameId);
        
        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }

        if (game.players.length >= 2) {
          socket.emit('error', { message: 'Game is full' });
          return;
        }

        socket.join(gameId);
        game.players.push({
          id: socket.id,
          number: 1
        });

        this.io.to(gameId).emit('gameStarted', {
          gameState: game.currentState,
          currentPlayer: game.currentPlayer
        });
      });

      socket.on('makeMove', ({ gameId, move }: { gameId: string, move: Move }) => {
        const game = this.games.get(gameId);
        
        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }

        const player = game.players.find(p => p.id === socket.id);
        if (!player) {
          socket.emit('error', { message: 'Player not found in game' });
          return;
        }

        if (player.number !== game.currentPlayer) {
          socket.emit('error', { message: 'Not your turn' });
          return;
        }

        if (game.currentState.gameOver) {
          socket.emit('error', { message: 'Game is over' });
          return;
        }

        if (!this.isValidMove(game.currentState.board, move)) {
          socket.emit('error', { message: 'Invalid move' });
          return;
        }

        this.applyMove(game, move);
        game.currentPlayer = (game.currentPlayer + 1) % 2;

        this.io.to(gameId).emit('gameStateUpdated', {
          gameState: game.currentState,
          currentPlayer: game.currentPlayer
        });
      });

      socket.on('disconnect', () => {
        for (const [gameId, game] of this.games.entries()) {
          const playerIndex = game.players.findIndex(p => p.id === socket.id);
          if (playerIndex !== -1) {
            this.io.to(gameId).emit('playerDisconnected', {
              player: playerIndex
            });
            this.games.delete(gameId);
            break;
          }
        }
      });
    });
  }

  private createInitialGameState(): GameState {
    return {
      board: Array(3).fill(null).map(() => Array(3).fill(null)),
      gameOver: false,
      winner: null
    };
  }

  private isValidMove(board: (number | null)[][], move: Move): boolean {
    return board[move.row][move.col] === null;
  }

  private applyMove(game: GameRoom, move: Move): void {
    const { row, col } = move;
    game.currentState.board[row][col] = game.currentPlayer;

    if (this.checkWin(game.currentState.board, game.currentPlayer)) {
      game.currentState.gameOver = true;
      game.currentState.winner = game.currentPlayer;
    } else if (this.isBoardFull(game.currentState.board)) {
      game.currentState.gameOver = true;
    }
  }

  private checkWin(board: (number | null)[][], player: number): boolean {
    // Check rows
    for (let i = 0; i < 3; i++) {
      if (board[i].every(cell => cell === player)) {
        return true;
      }
    }

    // Check columns
    for (let j = 0; j < 3; j++) {
      if (board.every(row => row[j] === player)) {
        return true;
      }
    }

    // Check diagonals
    if (board[0][0] === player && board[1][1] === player && board[2][2] === player) {
      return true;
    }
    if (board[0][2] === player && board[1][1] === player && board[2][0] === player) {
      return true;
    }

    return false;
  }

  private isBoardFull(board: (number | null)[][]): boolean {
    return board.every(row => row.every(cell => cell !== null));
  }
}