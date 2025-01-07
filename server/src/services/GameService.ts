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
        await this.gamesCollection.createIndex({ code: 1 }, { unique: true });
        await this.gamesCollection.createIndex({ status: 1 });
        await this.gamesCollection.createIndex({ startTime: 1 });
        await this.gamesCollection.createIndex({ lastActivityAt: 1 });
        await this.gamesCollection.createIndex({ gameId: 1 });
    }

    async createGame(gameCode: string, player: IPlayer, initialState: IGameState): Promise<GameMetadata> {
        const game: GameMetadata = {
            gameId: gameCode,
            code: gameCode,
            status: 'waiting',
            startTime: new Date().toISOString(),
            lastActivityAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            players: {
                first: player.id
            },
            totalTurns: 0,
            boardSize: initialState.board.size,
            currentState: initialState
        };

        await this.gamesCollection.insertOne(game);
        return game;
    }

    async joinGame(gameCode: string, player: IPlayer): Promise<GameMetadata> {
        const result = await this.gamesCollection.findOneAndUpdate(
            { code: gameCode, status: 'waiting' },
            { 
                $set: { 
                    'players.second': player.id,
                    status: 'playing',
                    lastActivityAt: new Date().toISOString(),
                }
            },
            { returnDocument: 'after' }
        );

        if (!result) {
            throw new Error('Game not found or already completed');
        }

        return result;
    }

    async makeMove(gameCode: string, playerNumber: number, move: IGameMove): Promise<GameMetadata> {
        const game = await this.gamesCollection.findOne({ code: gameCode });
        if (!game) {
            throw new Error('Game not found');
        }

        if (game.status === 'finished') {
            throw new Error('Game is already completed');
        }

        // Применяем ход и получаем новое состояние
        const newState = GameLogicService.applyMove(game.currentState, move, playerNumber);

        // Обновляем состояние игры
        const now = new Date().toISOString();
        const updateData: Partial<GameMetadata> = { 
            currentState: newState,
            lastActivityAt: now,
            status: newState.gameOver ? 'finished' : 'playing',
            totalTurns: (game.totalTurns || 0) + 1,
            currentPlayer: newState.currentPlayer
        };

        if (newState.gameOver) {
            updateData.endTime = now;
            updateData.winner = newState.winner || undefined;
            updateData.finalScore = {
                1: newState.scores.player1,
                2: newState.scores.player2
            };
            updateData.duration = (new Date(now).getTime() - new Date(game.startTime).getTime()) / 1000;
        }

        const result = await this.gamesCollection.findOneAndUpdate(
            { code: gameCode },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        if (!result) {
            throw new Error('Failed to update game state');
        }

        return result;
    }

    async getGameState(gameCode: string): Promise<IGameState | null> {
        const game = await this.gamesCollection.findOne({ code: gameCode });
        return game?.currentState || null;
    }

    async getPlayer(gameCode: string, playerNumber: number): Promise<IPlayer | null> {
        const game = await this.gamesCollection.findOne({ code: gameCode });
        if (!game) return null;
        const playerId = playerNumber === 0 ? game.players.first : game.players.second;
        return playerId ? { id: playerId, number: playerNumber } : null;
    }

    async getSavedGames(): Promise<GameMetadata[]> {
        return this.gamesCollection.find({
            status: 'finished'
        }).sort({ endTime: -1 }).limit(50).toArray();
    }

    async getGameHistory(gameCode: string): Promise<number> {
        const game = await this.gamesCollection.findOne({ code: gameCode });
        if (!game) return 0;
        return game.currentState?.currentTurn.moves.length || 0;
    }

    async getGameStateAtMove(gameCode: string, moveNumber: number): Promise<IGameState | null> {
        const game = await this.gamesCollection.findOne({ code: gameCode });
        if (!game) return null;
        return game.currentState;
    }

    async finishGame(gameCode: string, winner: number | null, scores: { player1: number; player2: number }): Promise<void> {
        const now = new Date().toISOString();
        const game = await this.gamesCollection.findOne({ code: gameCode });
        if (!game) return;

        await this.gamesCollection.updateOne(
            { code: gameCode },
            {
                $set: {
                    status: 'finished',
                    endTime: now,
                    lastActivityAt: now,
                    winner: winner !== null ? winner : undefined,
                    finalScore: {
                        1: scores.player1,
                        2: scores.player2
                    },
                    duration: (new Date(now).getTime() - new Date(game.startTime).getTime()) / 1000
                }
            }
        );
    }

    async disconnect(): Promise<void> {
        await this.mongoClient?.close();
    }
}