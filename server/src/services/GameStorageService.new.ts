import { GameMove } from '@ctor-game/shared/types/game/moves.js';
import { Player } from '@ctor-game/shared/types/base/enums.js';
import { GameStatus } from '@ctor-game/shared/types/primitives.js';
import { GameMetadata, GameHistory, GameDetails } from '@ctor-game/shared/types/storage/metadata.new.js';
import { MongoClient, Collection } from 'mongodb';
import { logger } from '../utils/logger.js';

export class GameStorageError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'GameStorageError';
    }
}

/**
 * Service for storing and retrieving game data
 * Uses MongoDB for both metadata and move history
 */
export class GameStorageService {
    private gamesCollection!: Collection<GameMetadata>;
    private movesCollection!: Collection<GameMove>;
    private mongoClient!: MongoClient;

    constructor(
        private readonly mongoUrl: string = process.env.MONGODB_URL || 'mongodb://localhost:27017'
    ) {}

    async connect(): Promise<void> {
        this.mongoClient = new MongoClient(this.mongoUrl, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000
        });
        
        await this.mongoClient.connect();
        const db = this.mongoClient.db('ctorgame');
        
        this.gamesCollection = db.collection<GameMetadata>('games');
        this.movesCollection = db.collection<GameMove>('moves');
        
        // Create indexes
        await this.gamesCollection.createIndex({ gameId: 1 }, { unique: true });
        await this.gamesCollection.createIndex({ code: 1 }, { unique: true });
        await this.gamesCollection.createIndex({ status: 1 });
        await this.gamesCollection.createIndex({ lastActivityAt: 1 });
        await this.gamesCollection.createIndex({ expiresAt: 1 });
        await this.gamesCollection.createIndex({ status: 1, lastActivityAt: 1 });
        
        // Indexes for moves collection
        await this.movesCollection.createIndex({ gameId: 1 });
        await this.movesCollection.createIndex({ gameId: 1, timestamp: 1 });
    }

    async disconnect(): Promise<void> {
        await this.mongoClient?.close();
    }

    /**
     * Creates a new game with the first player
     */
    async createGame(playerId: string, gameId: string): Promise<GameMetadata> {
        const startTime = Date.now();
        
        // Check active games limit
        const activeCount = await this.gamesCollection.countDocuments({
            status: { $in: [GameStatus.WAITING, GameStatus.IN_PROGRESS] }
        });

        if (activeCount >= 50) {
            throw new GameStorageError('Maximum number of concurrent games reached');
        }

        // Generate unique connection code
        let code: string;
        let exists: GameMetadata | null;

        do {
            code = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            exists = await this.gamesCollection.findOne({ code });
        } while (exists);

        // Verify gameId is unique
        exists = await this.gamesCollection.findOne({ gameId });
        if (exists) {
            throw new GameStorageError('Game ID already exists');
        }

        const now = new Date();
        const game: GameMetadata = {
            gameId,
            code,
            status: GameStatus.WAITING,
            startTime: now.toISOString(),
            lastActivityAt: now.toISOString(),
            expiresAt: new Date(now.getTime() + 30 * 60 * 1000).toISOString(),
            players: {
                first: playerId
            },
            boardSize: { width: 10, height: 10 },
            totalTurns: 0
        };

        await this.gamesCollection.insertOne(game);
        
        logger.game.storage('create_game', {
            gameId,
            code,
            playerId,
            duration: Date.now() - startTime
        });

        return game;
    }

    /**
     * Adds second player to the game
     */
    async joinGame(gameIdOrCode: string, playerId: string): Promise<GameMetadata> {
        const startTime = Date.now();
        const now = new Date();

        // Try to find game by either gameId or code
        const result = await this.gamesCollection.findOneAndUpdate(
            {
                $or: [{ gameId: gameIdOrCode }, { code: gameIdOrCode }],
                status: GameStatus.WAITING,
                expiresAt: { $gt: now.toISOString() },
                'players.second': null
            },
            {
                $set: {
                    'players.second': playerId,
                    status: GameStatus.IN_PROGRESS,
                    lastActivityAt: now.toISOString(),
                    expiresAt: new Date(now.getTime() + 30 * 60 * 1000).toISOString()
                }
            },
            { returnDocument: 'after' }
        );

        if (!result) {
            // Check why join failed
            const game = await this.gamesCollection.findOne({
                $or: [{ gameId: gameIdOrCode }, { code: gameIdOrCode }]
            });
            
            if (!game) {
                throw new GameStorageError(`Game not found with ID/code: ${gameIdOrCode}`);
            } else if (game.status !== GameStatus.WAITING) {
                throw new GameStorageError('Game already started');
            } else if (game.expiresAt <= now.toISOString()) {
                throw new GameStorageError('Game expired');
            } else {
                throw new GameStorageError('Game is full');
            }
        }

        logger.game.storage('join_game', {
            gameId: result.gameId,
            playerId,
            duration: Date.now() - startTime
        });

        return result;
    }

    /**
     * Records a move in the game history
     */
    async recordMove(gameId: string, move: GameMove): Promise<void> {
        const startTime = Date.now();
        
        // Add gameId to the move for reference
        const moveWithGameId = { ...move, gameId };
        await this.movesCollection.insertOne(moveWithGameId);

        // Update game metadata
        const now = new Date();
        await this.gamesCollection.updateOne(
            { gameId },
            {
                $set: {
                    lastActivityAt: now.toISOString(),
                    expiresAt: new Date(now.getTime() + 30 * 60 * 1000).toISOString()
                },
                $inc: { totalTurns: 1 }
            }
        );

        logger.game.storage('record_move', {
            gameId,
            moveType: move.type,
            player: move.player,
            duration: Date.now() - startTime
        });
    }

    /**
     * Marks game as finished with final scores
     */
    async finishGame(
        gameId: string,
        winner: Player,
        finalScore: { [Player.First]: number; [Player.Second]: number }
    ): Promise<void> {
        const startTime = Date.now();
        const now = new Date();

        const game = await this.gamesCollection.findOneAndUpdate(
            { gameId },
            {
                $set: {
                    status: GameStatus.FINISHED,
                    endTime: now.toISOString(),
                    winner,
                    finalScore,
                    lastActivityAt: now.toISOString()
                }
            },
            { returnDocument: 'after' }
        );

        if (!game) {
            throw new GameStorageError('Game not found');
        }

        // Calculate duration
        const duration = (now.getTime() - new Date(game.startTime).getTime()) / 1000;
        await this.gamesCollection.updateOne(
            { gameId },
            { $set: { duration } }
        );

        logger.game.storage('finish_game', {
            gameId,
            winner,
            duration: Date.now() - startTime
        });
    }

    /**
     * Removes expired games
     */
    async cleanupExpiredGames(): Promise<number> {
        const startTime = Date.now();
        const now = new Date();
        
        const result = await this.gamesCollection.deleteMany({
            status: { $in: [GameStatus.WAITING, GameStatus.IN_PROGRESS] },
            expiresAt: { $lte: now.toISOString() }
        });

        logger.game.storage('cleanup_games', {
            deletedCount: result.deletedCount,
            duration: Date.now() - startTime
        });

        return result.deletedCount;
    }

    /**
     * Retrieves complete game history
     */
    async getGameHistory(gameId: string): Promise<GameHistory> {
        const startTime = Date.now();

        // Get metadata
        const game = await this.gamesCollection.findOne({ gameId });
        if (!game) {
            throw new GameStorageError('Game not found');
        }

        // Get all moves
        const moves = await this.movesCollection
            .find({ gameId })
            .sort({ timestamp: 1 })
            .toArray();

        // Calculate move timing statistics
        const moveTimes: number[] = [];
        let totalTime = 0;
        
        for (let i = 1; i < moves.length; i++) {
            const moveTime = moves[i].timestamp - moves[i-1].timestamp;
            moveTimes.push(moveTime);
            totalTime += moveTime;
        }

        const avgMoveTime = moves.length > 1 ? totalTime / (moves.length - 1) : 0;

        // Create GameDetails structure
        const details: GameDetails = {
            moves,
            timing: {
                moveTimes,
                avgMoveTime
            },
            territoryHistory: [] // TODO: implement territory tracking
        };

        logger.game.storage('get_history', {
            gameId,
            movesCount: moves.length,
            duration: Date.now() - startTime
        });

        return {
            metadata: game,
            moves,
            details
        };
    }
}