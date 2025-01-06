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

        return game.moves.sort((a, b) => a.id - b.id);
    }

    /**
     * Получает состояние игры на определенном ходу
     * @param gameCode код игры 
     * @param moveNumber номер хода (0 - начальное состояние)
     */
    async getGameStateAtMove(gameCode: string, moveNumber: number): Promise<IGameState> {
        const game = await this.gameRepository.findOne({
            where: { gameCode },
            relations: ['moves']
        });

        if (!game) {
            throw new Error('Game not found');
        }

        // Если запрошено начальное состояние
        if (moveNumber === 0) {
            return this.createInitialGameState();
        }

        // Получаем все ходы до указанного номера
        const moves = game.moves
            .sort((a, b) => a.id - b.id)
            .slice(0, moveNumber);

        // Воссоздаем состояние игры, применяя ходы последовательно
        const state = this.createInitialGameState();
        
        for (const move of moves) {
            this.applyMoveToState(state, move.moveData, move.playerNumber);
        }

        return state;
    }

    /**
     * Получает ходы в указанном диапазоне
     * @param gameCode код игры
     * @param startMove начальный ход (включительно)
     * @param endMove конечный ход (включительно)
     */
    async getMovesInRange(gameCode: string, startMove: number, endMove: number): Promise<Move[]> {
        const game = await this.gameRepository.findOne({
            where: { gameCode },
            relations: ['moves']
        });

        if (!game) {
            throw new Error('Game not found');
        }

        return game.moves
            .sort((a, b) => a.id - b.id)
            .slice(startMove - 1, endMove);
    }

    /**
     * Применяет ход к состоянию игры
     * @param state текущее состояние
     * @param move ход для применения
     * @param playerNumber номер игрока
     */
    private applyMoveToState(state: IGameState, move: IGameMove, playerNumber: number): void {
        const { row, col } = move.position;

        if (move.type === OperationType.PLACE) {
            state.board[row][col] = playerNumber;
            state.currentTurn.placeOperationsLeft--;
        } else if (move.type === OperationType.REPLACE) {
            state.board[row][col] = playerNumber;
        }

        // Обновляем счет
        let player1Count = 0;
        let player2Count = 0;
        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                if (state.board[i][j] === 0) player1Count++;
                else if (state.board[i][j] === 1) player2Count++;
            }
        }
        state.scores = {
            player1: player1Count,
            player2: player2Count
        };
    }

    /**
     * Создает начальное состояние игры
     */
    private createInitialGameState(): IGameState {
        return {
            board: Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)),
            currentTurn: {
                playerNumber: 0,
                placeOperationsLeft: 2,
                replaceOperationsLeft: 0
            },
            scores: {
                player1: 0,
                player2: 0
            },
            gameOver: false,
            winner: null
        };
    }

    /**
     * Проверяет корректность последовательности ходов
     * @param gameCode код игры
     * @param moves последовательность ходов для проверки
     */
    async validateMoveSequence(gameCode: string, moves: IGameMove[]): Promise<boolean> {
        const state = this.createInitialGameState();
        
        try {
            for (let i = 0; i < moves.length; i++) {
                const move = moves[i];
                const playerNumber = i % 2; // Чередование игроков

                // Проверяем базовую валидность хода
                if (!this.isValidMove(state, move, playerNumber)) {
                    return false;
                }

                // Применяем ход
                this.applyMoveToState(state, move, playerNumber);
            }
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Проверяет валидность хода
     * @param state текущее состояние
     * @param move проверяемый ход
     * @param playerNumber номер игрока
     */
    private isValidMove(state: IGameState, move: IGameMove, playerNumber: number): boolean {
        const { row, col } = move.position;

        // Проверяем границы доски
        if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
            return false;
        }

        // Проверяем тип операции
        if (move.type === OperationType.PLACE) {
            // Для размещения клетка должна быть пустой
            if (state.board[row][col] !== null) {
                return false;
            }
            // Проверяем наличие доступных операций размещения
            if (state.currentTurn.placeOperationsLeft <= 0) {
                return false;
            }
        } else if (move.type === OperationType.REPLACE) {
            // Для замены клетка должна быть занята другим игроком
            if (state.board[row][col] === null || state.board[row][col] === playerNumber) {
                return false;
            }
        }

        return true;
    }

    /**
     * Получает список сохраненных игр
     * @returns Массив сохраненных игр
     */
    async getSavedGames(): Promise<Game[]> {
        const games = await this.gameRepository.find({
            select: [
                'id',
                'gameCode',
                'winner',
                'isCompleted',
                'players',
                'createdAt',
                'completedAt'
            ],
            order: {
                createdAt: 'DESC'
            },
            take: 50 // Ограничиваем количество, чтобы не перегружать клиент
        });

        return games;
    }
}