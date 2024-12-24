import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Game } from '../entities/Game';
import { Move } from '../entities/Move';
import { 
    IGameState, 
    IGameMove, 
    IPlayer, 
    OperationType,
    BOARD_SIZE 
} from '@ctor-game/shared/types';

export class GameService {
    private gameRepository: Repository<Game>;
    private moveRepository: Repository<Move>;

    constructor() {
        this.gameRepository = AppDataSource.getRepository(Game);
        this.moveRepository = AppDataSource.getRepository(Move);
    }

    async createGame(gameCode: string, player: IPlayer, initialState: IGameState): Promise<Game> {

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

    async makeMove(gameCode: string, playerNumber: number, move: IGameMove): Promise<Game> {
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

        // Начинаем транзакцию для атомарного обновления
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Сохраняем ход в истории
            const newMove = this.moveRepository.create({
                gameId: game.id,
                playerNumber,
                moveData: {
                    type: move.type,
                    position: move.position,
                    timestamp: new Date()
                }
            });
            await queryRunner.manager.save(newMove);

            // Обновляем состояние игры в зависимости от типа хода
            const { row, col } = move.position;
            
            if (move.type === OperationType.PLACE) {
                // Для операции размещения уменьшаем количество доступных ходов
                game.currentState.currentTurn.placeOperationsLeft--;
                game.currentState.board[row][col] = playerNumber;
            } else if (move.type === OperationType.REPLACE) {
                // Для операции замены просто меняем владельца клетки
                game.currentState.board[row][col] = playerNumber;
            }

            // Обновляем счет
            let player1Count = 0;
            let player2Count = 0;
            for (let i = 0; i < BOARD_SIZE; i++) {
                for (let j = 0; j < BOARD_SIZE; j++) {
                    if (game.currentState.board[i][j] === 0) player1Count++;
                    else if (game.currentState.board[i][j] === 1) player2Count++;
                }
            }
            game.currentState.scores = {
                player1: player1Count,
                player2: player2Count
            };

            // Проверяем окончание игры
            const isBoardFull = game.currentState.board.every(row => 
                row.every(cell => cell !== null)
            );

            if (isBoardFull) {
                game.currentState.gameOver = true;
                game.isCompleted = true;
                game.completedAt = new Date();
                
                // Определяем победителя по количеству фишек
                if (player1Count > player2Count) {
                    game.currentState.winner = 0;
                    game.winner = 0;
                } else if (player2Count > player1Count) {
                    game.currentState.winner = 1;
                    game.winner = 1;
                } else {
                    game.currentState.winner = null; // Ничья
                }
            }

            // Сохраняем обновленное состояние игры
            await queryRunner.manager.save(game);
            await queryRunner.commitTransaction();
            
            return game;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
    }

    async getGame(gameCode: string): Promise<Game | null> {
        return await this.gameRepository.findOne({ 
            where: { gameCode },
            relations: ['moves']
        });
    }

    async updateGameState(gameCode: string, newState: IGameState): Promise<Game> {
        const game = await this.gameRepository.findOne({ 
            where: { gameCode }
        });

        if (!game) {
            throw new Error('Game not found');
        }

        game.currentState = newState;
        if (newState.gameOver) {
            game.isCompleted = true;
            game.completedAt = new Date();
            game.winner = newState.winner;
        }

        return await this.gameRepository.save(game);
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
}