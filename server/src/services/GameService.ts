import { MongoClient, Collection } from 'mongodb';
import { 
    IGameState, 
    IGameMove, 
    IPlayer,
    GameMetadata
} from '@ctor-game/shared/types';
import { GameLogicService } from './GameLogicService';

export class GameService {
    private gamesCollection: Collection<GameMetadata>;
    private mongoClient: MongoClient;

    constructor(
        private readonly mongoUrl: string = process.env.MONGODB_URL || 'mongodb://localhost:27017'
    ) {
        this.initializeDatabase();
    }

    private async initializeDatabase() {
        this.mongoClient = new MongoClient(this.mongoUrl);
        await this.mongoClient.connect();
        this.gamesCollection = this.mongoClient.db('ctorgame').collection<GameMetadata>('games');
        
        // Create indexes
        await this.gamesCollection.createIndex({ gameCode: 1 }, { unique: true });
        await this.gamesCollection.createIndex({ isCompleted: 1 });
        await this.gamesCollection.createIndex({ createdAt: 1 });
    }

    async createGame(gameCode: string, player: IPlayer, initialState: IGameState): Promise<GameMetadata> {
        const game = {
            gameCode,
            currentState: initialState,
            players: [player],
            isCompleted: false,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await this.gamesCollection.insertOne(game);
        return game;
    }

    async joinGame(gameCode: string, player: IPlayer): Promise<GameMetadata> {
        const result = await this.gamesCollection.findOneAndUpdate(
            { gameCode, isCompleted: false },
            { 
                $push: { players: player },
                $set: { updatedAt: new Date() }
            },
            { returnDocument: 'after' }
        );

        if (!result) {
            throw new Error('Game not found or already completed');
        }

        return result;
    }

    async makeMove(gameCode: string, playerNumber: number, move: IGameMove): Promise<GameMetadata> {
        const game = await this.gamesCollection.findOne({ gameCode });
        if (!game) {
            throw new Error('Game not found');
        }

        if (game.isCompleted) {
            throw new Error('Game is already completed');
        }

        // Применяем ход и получаем новое состояние
        const newState = GameLogicService.applyMove(game.currentState, move, playerNumber);

        // Обновляем состояние игры
        const result = await this.gamesCollection.findOneAndUpdate(
            { gameCode },
            { 
                $set: { 
                    currentState: newState,
                    updatedAt: new Date(),
                    isCompleted: newState.gameOver,
                    completedAt: newState.gameOver ? new Date() : undefined,
                    winner: newState.winner
                }
            },
            { returnDocument: 'after' }
        );

        if (!result) {
            throw new Error('Failed to update game state');
        }

        return result;
    }

    async getGameState(gameCode: string): Promise<IGameState | null> {
        const game = await this.gamesCollection.findOne({ gameCode });
        return game?.currentState || null;
    }

    async getPlayer(gameCode: string, playerNumber: number): Promise<IPlayer | null> {
        const game = await this.gamesCollection.findOne({ gameCode });
        return game?.players.find(p => p.number === playerNumber) || null;
    }

    async getSavedGames(): Promise<GameMetadata[]> {
        return this.gamesCollection.find({
            status: 'finished'
        }).sort({ endTime: -1 }).limit(50).toArray();
    }

    async getGameHistory(gameCode: string): Promise<GameHistory | null> {
        const game = await this.gamesCollection.findOne({ gameCode });
        if (!game) return null;

        return {
            metadata: game,
            moves: [],
            details: {
                moves: [],
                timing: {
                    moveTimes: [],
                    avgMoveTime: 0
                },
                territoryHistory: []
            }
        };
    }

    async getGameStateAtMove(gameCode: string, moveNumber: number): Promise<IGameState | null> {
        const game = await this.gamesCollection.findOne({ gameCode });
        if (!game) return null;
        return game.currentState;
    }

    async finishGame(gameCode: string, winner: number | null): Promise<void> {
        await this.gamesCollection.updateOne(
            { gameCode },
            {
                $set: {
                    isCompleted: true,
                    completedAt: new Date(),
                    winner,
                    updatedAt: new Date()
                }
            }
        );
    }

    async disconnect(): Promise<void> {
        await this.mongoClient?.close();
    }
}