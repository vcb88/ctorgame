import type { GameMove, GameStatus, Scores, GameMetadata, GameDetails, GameHistory } from '@ctor-game/shared/types/core.js';
import { validateGameHistoryEntry } from '@ctor-game/shared/utils/validation.js';
import { ValidationError } from '@ctor-game/shared/types/core.js';
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { MongoClient, Collection } from 'mongodb';
import Redis from 'ioredis';

export class GameStorageError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'GameStorageError';
    }
}

export class GameStorageService {
    private gamesCollection!: Collection<GameMetadata>;
    private mongoClient!: MongoClient;
    private storagePath: string;

    constructor(
        private readonly mongoUrl: string = process.env.MONGODB_URL || 'mongodb://localhost:27017',
        _redisClient?: Redis,
        storagePath?: string
    ) {
        this.storagePath = storagePath || process.env.STORAGE_PATH || 'storage/games';
        // Initialize storage synchronously as it's file system operations
        this.initializeStorage();
    }

    private initializeStorage(): void {
        try {
            mkdirSync(this.storagePath, { recursive: true });
        } catch (e) {
            throw new GameStorageError(`Failed to initialize storage: ${e}`);
        }
    }

    /**
     * Get the full path to the game file, organized in date-based directories
     * Format: <storage_path>/YYYY/MM/DD/<gameId>.json
     * @param gameId unique game identifier
     * @returns full path to the JSON file
     */
    private getGamePath(gameId: string): string {
        const now = new Date();
        const datePath = join(
            this.storagePath,
            now.getFullYear().toString(),
            (now.getMonth() + 1).toString().padStart(2, '0'),
            now.getDate().toString().padStart(2, '0')
        );
        
        // Create date-based directory structure
        mkdirSync(datePath, { recursive: true });
        
        return join(datePath, `${gameId}.json`);
    }

    /**
     * Read game data from a JSON file
     * @param path path to the game file
     * @returns game data with moves and metadata
     */
    private readGameFile(path: string): { moves: GameMove[], metadata: Record<string, unknown> } {
        try {
            const content = readFileSync(path, 'utf8');
            return JSON.parse(content);
        } catch (e) {
            return { moves: [], metadata: {} };
        }
    }

    /**
     * Write game data to a JSON file
     * @param path path to the game file
     * @param data game data to write
     */
    private writeGameFile(path: string, data: { moves: GameMove[], metadata: Record<string, unknown> }): void {
        writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
    }

    /**
     * Find the actual path to a game file by searching through date directories
     * This is useful when we need to find a file that was created on a different day
     * @param gameId unique game identifier
     * @returns full path to the JSON file or null if not found
     */
    private findGameFile(gameId: string): string | null {
        // Function to check a specific date
        const checkDate = (date: Date): string | null => {
            const datePath = join(
                this.storagePath,
                date.getFullYear().toString(),
                (date.getMonth() + 1).toString().padStart(2, '0'),
                date.getDate().toString().padStart(2, '0'),
                `${gameId}.json`
            );
            return existsSync(datePath) ? datePath : null;
        };

        // Check today first
        const today = new Date();
        const todayPath = checkDate(today);
        if (todayPath) return todayPath;

        // Check yesterday
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayPath = checkDate(yesterday);
        if (yesterdayPath) return yesterdayPath;

        // For MVP, we only check today and yesterday
        // In production, we might want to implement a more comprehensive search
        // or store file locations in a database
        return null;
    }

    async connect(): Promise<void> {
        this.mongoClient = new MongoClient(this.mongoUrl, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000
        });
        await this.mongoClient.connect();
        this.gamesCollection = this.mongoClient.db('ctorgame').collection<GameMetadata>('games');
        
        // Create indexes
        await this.gamesCollection.createIndex({ gameId: 1 }, { unique: true });
        await this.gamesCollection.createIndex({ code: 1 }, { unique: true });
        await this.gamesCollection.createIndex({ status: 1 });
        await this.gamesCollection.createIndex({ lastActivityAt: 1 });
        await this.gamesCollection.createIndex({ expiresAt: 1 });
        await this.gamesCollection.createIndex({ status: 1, lastActivityAt: 1 });
    }

    async disconnect(): Promise<void> {
        await this.mongoClient?.close();
    }
    
    /**
     * Get all saved games
     * @returns array of game summaries
     */
    async getSavedGames(): Promise<GameMetadata[]> {
        return await this.gamesCollection.find({
            status: { $in: ['finished', 'expired'] }
        }).toArray();
    }

    async createGame(playerId: string, gameId: string): Promise<GameMetadata> {
        // Check active games limit
        const activeCount = await this.gamesCollection.countDocuments({
            status: { $in: ['waiting', 'active'] }
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
            status: 'waiting',
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
        return game;
    }

    async joinGame(gameIdOrCode: string, playerId: string): Promise<GameMetadata> {
        const now = new Date();
        // Try to find game by either gameId or code
        const result = await this.gamesCollection.findOneAndUpdate(
            {
                $or: [{ gameId: gameIdOrCode }, { code: gameIdOrCode }],
                status: 'waiting',
                expiresAt: { $gt: now.toISOString() },
                'players.second': null
            },
            {
                $set: {
                    'players.second': playerId,
                    status: 'active',
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
            } else if (game.status !== 'waiting') {
                throw new GameStorageError('Game already started');
            } else if (game.expiresAt <= now.toISOString()) {
                throw new GameStorageError('Game expired');
            } else {
                throw new GameStorageError('Game is full');
            }
        }

        return result;
    }

    async recordMove(gameId: string, move: GameMove): Promise<void> {
        const gamePath = this.getGamePath(gameId);
        const gameData = this.readGameFile(gamePath);
        gameData.moves.push(move);

        // Update metadata
        gameData.metadata = {
            ...gameData.metadata,
            lastUpdate: new Date().toISOString(),
            moveTimes: gameData.metadata.moveTimes || [],  // TODO: implement move timing tracking
            avgMoveTime: gameData.metadata.avgMoveTime || 0, // TODO: implement move timing tracking
            territoryHistory: gameData.metadata.territoryHistory || []  // TODO: implement territory history tracking
        };

        this.writeGameFile(gamePath, gameData);

        // Update game metadata in MongoDB
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
    }

    async finishGame(
        gameId: string,
        winner: number,
        scores: Scores
    ): Promise<void> {
        const now = new Date();
        const game = await this.gamesCollection.findOneAndUpdate(
            { gameId },
            {
                $set: {
                    status: 'finished',
                    endTime: now.toISOString(),
                    winner,
                    finalScore: scores,
                    lastActivityAt: now.toISOString()
                }
            },
            { returnDocument: 'after' }
        );

        if (!game) {
            throw new GameStorageError('Game not found');
        }

        // Calculate duration
        const startTime = new Date(game.startTime);
        const duration = (now.getTime() - startTime.getTime()) / 1000;

        await this.gamesCollection.updateOne(
            { gameId },
            { $set: { duration } }
        );
    }

    async cleanupExpiredGames(): Promise<number> {
        const now = new Date();
        const result = await this.gamesCollection.deleteMany({
            status: { $in: ['waiting', 'active'] },
            expiresAt: { $lte: now.toISOString() }
        });
        return result.deletedCount;
    }

    /**
     * Find a game by its connection code
     * @param code 4-digit game connection code
     * @returns game metadata or null if not found
     */
    async findGameByCode(code: string): Promise<GameMetadata | null> {
        return await this.gamesCollection.findOne({ code });
    }

    /**
     * Mark a game as expired
     * @param gameId unique game identifier
     */
    async markGameExpired(gameId: string): Promise<void> {
        const now = new Date();
        await this.gamesCollection.updateOne(
            { gameId },
            {
                $set: {
                    status: 'expired',
                    lastActivityAt: now.toISOString(),
                    expiresAt: now.toISOString()
                }
            }
        );
    }

    /**
     * Get full game history including metadata, moves and details
     * @param gameId unique game identifier
     * @returns complete game history
     * @throws GameStorageError if game not found or history file is corrupted
     */
    async getGameHistory(gameId: string): Promise<GameHistory> {
        // Get metadata from MongoDB
        const game = await this.gamesCollection.findOne({ gameId });
        if (!game) {
            throw new GameStorageError('Game not found');
        }

        // Try to find the game file
        const gamePath = this.findGameFile(gameId);
        if (!gamePath) {
            throw new GameStorageError('Game history not found');
        }

        try {
            const gameData = this.readGameFile(gamePath);
            const moves = gameData.moves;
            const storedDetails = gameData.metadata || {};

            // Create proper GameDetails structure
            const details: GameDetails = {
                moves: moves,
                timing: {
                    moveTimes: (storedDetails.moveTimes as number[]) || [],
                    avgMoveTime: (storedDetails.avgMoveTime as number) || 0
                },
                territoryHistory: (storedDetails.territoryHistory as Array<{ player1: number; player2: number }>) || []
            };

            return {
                metadata: game,
                moves,
                details
            };
        } catch (e) {
            throw new GameStorageError(`Failed to load game history: ${e}`);
        }
    }
}