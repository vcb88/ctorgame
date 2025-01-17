import type {
    GameState,
    PlayerNumber,
    GameMove,
    Player,
    GameStatus,
    Position
} from '@ctor-game/shared/types/game';

import type {
    RedisGameState,
    RedisPlayerSession,
    RedisConnectionInfo,
    RedisSessionActivity,
    RedisGameRoom,
    RedisGameEvent
} from '@ctor-game/shared/types/redis';

import { redisClient, REDIS_KEYS, REDIS_EVENTS, withLock, ttlConfig } from '../config/redis.js';
import { GameLogicService } from './GameLogicService.js';

export class RedisService {
    /**
     * Connect to Redis server
     */
    async connect(): Promise<void> {
        await redisClient.connect();
    }

    /**
     * Disconnect from Redis server
     */
    async disconnect(): Promise<void> {
        await redisClient.disconnect();
    }
    /**
     * Set a value with expiration time
     */
    async setWithExpiry(key: string, value: string, ttl: number): Promise<void> {
        await redisClient.setex(key, ttl, value);
    }

    /**
     * Add an item to a list
     */
    async addToList(key: string, value: string): Promise<void> {
        await redisClient.lpush(key, value);
    }

    /**
     * Get a value
     */
    async get(key: string): Promise<string | null> {
        return redisClient.get(key);
    }

    /**
     * Get a list
     */
    async getList(key: string): Promise<string[]> {
        return redisClient.lrange(key, 0, -1);
    }

    /**
     * Delete a key
     */
    async delete(key: string): Promise<void> {
        await redisClient.del(key);
    }

    /**
     * Сохраняет состояние игры
     */
    async setGameState(gameId: string, state: GameState): Promise<void> {
        const redisState: RedisGameState = {
            ...state,
            lastUpdate: Date.now(),
            version: Date.now() // Using timestamp as version for optimistic locking
        };

        await withLock(gameId, async () => {
            await redisClient
                .multi()
                .set(
                    REDIS_KEYS.GAME_STATE(gameId),
                    JSON.stringify(redisState),
                    'EX',
                    ttlConfig.base.gameState
                )
                .publish(REDIS_EVENTS.GAME_STATE_UPDATED, JSON.stringify({ gameId, state: redisState }))
                .exec();
        });
    }

    /**
     * Получает состояние игры
     */
    async getGameState(gameId: string): Promise<GameState | null> {
        const state = await redisClient.get(REDIS_KEYS.GAME_STATE(gameId));
        if (!state) return null;

        const redisState: RedisGameState = JSON.parse(state);
        // Исключаем служебные поля при возврате
        const { lastUpdate, version, ...gameState } = redisState;
        return gameState;
    }

    /**
     * Обновляет состояние игры после хода
     */
    async updateGameState(
        gameId: string,
        playerNumber: PlayerNumber,
        serverMove: Omit<GameMove, 'player' | 'timestamp'>,
        validateMove: boolean = true
    ): Promise<GameState> {
        return await withLock(gameId, async () => {
            const currentState = await this.getGameState(gameId);
            if (!currentState) {
                throw new Error('Game state not found');
            }

            // Create game move from server move
            const move: GameMove = {
                ...serverMove,
                player: playerNumber
            };

            if (validateMove) {
                const isValid = GameLogicService.isValidMove(currentState, move, playerNumber);
                if (!isValid) {
                    throw new Error('Invalid move');
                }
            }

            const newState = GameLogicService.applyMove(currentState, move, playerNumber);
            await this.setGameState(gameId, newState);
            return newState;
        });
    }

    /**
     * Сохраняет сессию игрока
     */
    async setPlayerSession(
        socketId: string,
        gameId: string,
        playerNumber: PlayerNumber
    ): Promise<void> {
        const session: RedisPlayerSession = {
            id: socketId,
            gameId,
            playerId: socketId,
            playerNumber,
            connection: {
                ip: '',
                lastActivity: Date.now(),
                connectTime: Date.now()
            },
            activity: {
                idleTime: 0,
                moveCount: 0,
                chatCount: 0
            }
        };

        await redisClient.setex(
            REDIS_KEYS.PLAYER_SESSION(socketId),
            ttlConfig.base.playerSession,
            JSON.stringify(session)
        );
    }

    /**
     * Получает сессию игрока
     */
    async getPlayerSession(socketId: string): Promise<RedisPlayerSession | null> {
        const session = await redisClient.get(REDIS_KEYS.PLAYER_SESSION(socketId));
        return session ? JSON.parse(session) : null;
    }

    /**
     * Обновляет активность игрока
     */
    async updatePlayerActivity(socketId: string): Promise<void> {
        const session = await this.getPlayerSession(socketId);
        if (session) {
            session.connection.lastActivity = Date.now();
            await this.setPlayerSession(
                socketId,
                session.gameId,
                session.playerNumber
            );
        }
    }

    /**
     * Удаляет сессию игрока и оповещает других игроков
     */
    async removePlayerSession(socketId: string): Promise<void> {
        const session = await this.getPlayerSession(socketId);
        if (session) {
            await redisClient
                .multi()
                .del(REDIS_KEYS.PLAYER_SESSION(socketId))
                .publish(
                    REDIS_EVENTS.PLAYER_DISCONNECTED,
                    JSON.stringify({
                        gameId: session.gameId,
                        playerNumber: session.playerNumber
                    })
                )
                .exec();
        }
    }

    /**
     * Сохраняет информацию об игровой комнате
     */
    async setGameRoom(gameId: string, players: RedisPlayerSession[]): Promise<void> {
        const room: RedisGameRoom = {
            gameId,
            players,
            status: players.length === 2 ? 'active' : 'waiting',
            lastUpdate: Date.now()
        };

        await redisClient.setex(
            REDIS_KEYS.GAME_ROOM(gameId),
            ttlConfig.base.gameRoom,
            JSON.stringify(room)
        );
    }

    /**
     * Получает информацию об игровой комнате
     */
    async getGameRoom(gameId: string): Promise<RedisGameRoom | null> {
        const room = await redisClient.get(REDIS_KEYS.GAME_ROOM(gameId));
        return room ? JSON.parse(room) : null;
    }

    /**
     * Добавляет игрока в комнату
     */
    async addPlayerToRoom(gameId: string, player: RedisPlayerSession): Promise<void> {
        await withLock(gameId, async () => {
            const room = await this.getGameRoom(gameId);
            if (!room) {
                // Создаем новую комнату
                await this.setGameRoom(gameId, [player]);
            } else if (room.players.length < 2) {
                // Создаем новый массив игроков
                const updatedPlayers = [...room.players, player];
                await this.setGameRoom(gameId, updatedPlayers);
            } else {
                throw new Error('Room is full');
            }
        });
    }

    /**
     * Удаляет игрока из комнаты
     */
    async removePlayerFromRoom(gameId: string, socketId: string): Promise<void> {
        await withLock(gameId, async () => {
            const room = await this.getGameRoom(gameId);
            if (room) {
                const updatedPlayers = room.players.filter(p => p.id !== socketId);
                if (updatedPlayers.length === 0) {
                    // Если комната пустая, удаляем её
                    await redisClient.del(REDIS_KEYS.GAME_ROOM(gameId));
                } else {
                    // Обновляем комнату с новым списком игроков
                    await this.setGameRoom(gameId, updatedPlayers);
                }
            }
        });
    }

    /**
     * Добавляет событие в историю игры
     */
    async addGameEvent(event: RedisGameEvent): Promise<void> {
        const key = REDIS_KEYS.GAME_EVENTS(event.gameId);
        await redisClient
            .multi()
            .lpush(key, JSON.stringify(event))
            .expire(key, ttlConfig.base.gameState)
            .exec();
    }

    /**
     * Получает последние события игры
     */
    async getGameEvents(gameId: string, limit: number = 10): Promise<RedisGameEvent[]> {
        const events = await redisClient.lrange(REDIS_KEYS.GAME_EVENTS(gameId), 0, limit - 1);
        return events.map((e: string) => JSON.parse(e));
    }

    /**
     * Добавляет игру в список активных
     */
    async addActiveGame(gameId: string): Promise<void> {
        await redisClient.sadd(REDIS_KEYS.ACTIVE_GAMES, gameId);
    }

    /**
     * Удаляет игру из списка активных
     */
    async removeActiveGame(gameId: string): Promise<void> {
        await redisClient.srem(REDIS_KEYS.ACTIVE_GAMES, gameId);
    }

    /**
     * Получает список активных игр
     */
    async getActiveGames(): Promise<string[]> {
        return await redisClient.smembers(REDIS_KEYS.ACTIVE_GAMES);
    }

    /**
     * Очищает все данные игры
     */
    async cleanupGame(gameId: string): Promise<void> {
        const keys = [
            REDIS_KEYS.GAME_STATE(gameId),
            REDIS_KEYS.GAME_ROOM(gameId),
            REDIS_KEYS.GAME_EVENTS(gameId),
            REDIS_KEYS.GAME_LOCK(gameId)
        ];

        await redisClient
            .multi()
            .del(...keys)
            .srem(REDIS_KEYS.ACTIVE_GAMES, gameId)
            .exec();
    }

    /**
     * Обновляет статистику игры
     */
    async updateGameStats(gameId: string, stats: Record<string, unknown>): Promise<void> {
        await redisClient
            .multi()
            .hset(REDIS_KEYS.GAME_STATS, gameId, JSON.stringify(stats))
            .expire(REDIS_KEYS.GAME_STATS, ttlConfig.base.gameState)
            .exec();
    }

    /**
     * Получает статистику игры
     */
    async getGameStats(gameId: string): Promise<Record<string, unknown> | null> {
        const stats = await redisClient.hget(REDIS_KEYS.GAME_STATS, gameId);
        return stats ? JSON.parse(stats) : null;
    }

    /**
     * Создает новую игру
     */
    async createGame(gameId: string, player: RedisPlayerSession, initialState: GameState): Promise<void> {
        await Promise.all([
            this.setGameState(gameId, initialState),
            this.setGameRoom(gameId, [player]),
            this.addActiveGame(gameId)
        ]);
    }

    /**
     * Присоединяет игрока к существующей игре
     */
    async joinGame(gameId: string, player: RedisPlayerSession): Promise<void> {
        await this.addPlayerToRoom(gameId, player);
    }

    /**
     * Получает номер текущего игрока из состояния игры
     */
    getCurrentPlayer(state: GameState): PlayerNumber {
        return state.currentPlayer;
    }

    /**
     * Set TTL for game state
     * @param gameId game identifier
     * @param ttl TTL in seconds
     */
    async expireGameState(gameId: string, ttl: number): Promise<void> {
        await redisClient
            .multi()
            .expire(REDIS_KEYS.GAME_STATE(gameId), ttl)
            .expire(REDIS_KEYS.GAME_ROOM(gameId), ttl)
            .expire(REDIS_KEYS.GAME_EVENTS(gameId), ttl)
            .expire(REDIS_KEYS.GAME_STATS, ttl)
            .exec();
    }

    /**
     * Delete game state immediately
     * @param gameId game identifier
     */
    async deleteGameState(gameId: string): Promise<void> {
        await redisClient
            .multi()
            .del(REDIS_KEYS.GAME_STATE(gameId))
            .del(REDIS_KEYS.GAME_ROOM(gameId))
            .del(REDIS_KEYS.GAME_EVENTS(gameId))
            .del(REDIS_KEYS.GAME_STATS, gameId)
            .exec();
    }
}