import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Game } from '../entities/Game';
import { Move } from '../entities/Move';
import { IGameState, IMove, IPlayer } from '../../../shared/types';

export class GameService {
    private gameRepository: Repository<Game>;
    private moveRepository: Repository<Move>;

    constructor() {
        this.gameRepository = AppDataSource.getRepository(Game);
        this.moveRepository = AppDataSource.getRepository(Move);
    }

    async createGame(gameCode: string, player: IPlayer): Promise<Game> {
        const initialState: IGameState = {
            board: Array(3).fill(null).map(() => Array(3).fill(null)),
            gameOver: false,
            winner: null
        };

        const game = this.gameRepository.create({
            gameCode,
            currentState: initialState,
            players: [player],
            isCompleted: false
        });

        return await this.gameRepository.save(game);
    }

    async joinGame(gameCode: string, player: IPlayer): Promise<Game> {
        const game = await this.gameRepository.findOne({ where: { gameCode } });
        if (!game) {
            throw new Error('Game not found');
        }

        if (game.players.length >= 2) {
            throw new Error('Game is full');
        }

        game.players.push(player);
        return await this.gameRepository.save(game);
    }

    async makeMove(gameCode: string, playerNumber: number, move: IMove): Promise<Game> {
        const game = await this.gameRepository.findOne({ 
            where: { gameCode },
            relations: ['moves'] 
        });

        if (!game) {
            throw new Error('Game not found');
        }

        if (game.isCompleted) {
            throw new Error('Game is already completed');
        }

        // Сохраняем ход
        const newMove = this.moveRepository.create({
            gameId: game.id,
            playerNumber,
            moveData: move
        });
        await this.moveRepository.save(newMove);

        // Обновляем состояние игры
        const { row, col } = move;
        game.currentState.board[row][col] = playerNumber;

        // Проверяем на победу
        if (this.checkWin(game.currentState.board, playerNumber)) {
            game.currentState.gameOver = true;
            game.currentState.winner = playerNumber;
            game.isCompleted = true;
            game.completedAt = new Date();
            game.winner = playerNumber;
        } else if (this.isBoardFull(game.currentState.board)) {
            game.currentState.gameOver = true;
            game.isCompleted = true;
            game.completedAt = new Date();
        }

        return await this.gameRepository.save(game);
    }

    async getGame(gameCode: string): Promise<Game | null> {
        return await this.gameRepository.findOne({ 
            where: { gameCode },
            relations: ['moves']
        });
    }

    async getGameHistory(gameCode: string): Promise<Move[]> {
        const game = await this.gameRepository.findOne({ 
            where: { gameCode },
            relations: ['moves']
        });

        if (!game) {
            throw new Error('Game not found');
        }

        return game.moves;
    }

    private checkWin(board: (number | null)[][], player: number): boolean {
        // Проверка строк
        for (let i = 0; i < 3; i++) {
            if (board[i].every(cell => cell === player)) {
                return true;
            }
        }

        // Проверка столбцов
        for (let j = 0; j < 3; j++) {
            if (board.every(row => row[j] === player)) {
                return true;
            }
        }

        // Проверка диагоналей
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