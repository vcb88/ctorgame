// Game related types
import { IGameState } from '../../../shared/src/types/game/state.js';
import { Player } from '../../../shared/src/types/base/enums.js';
import { GameMove } from '../../../shared/src/types/game/moves.js';
import type { IServerMove } from '../../../shared/src/types/game/moves.js';
import type { IPlayer } from '../../../shared/src/types/game/players.js';

// Redis specific types
import {
    IRedisGameState,
    IRedisPlayerSession,
    IRedisGameRoom,
    IRedisGameEvent
} from '../../../shared/src/types/storage/redis.js';
import { redisClient, REDIS_KEYS, REDIS_EVENTS, withLock, cacheConfig } from '../config/redis.js';
import { GameLogicService } from './GameLogicService.js';

export class RedisService {
    /**
     * Сохраняет состояние игры
     */
    async setGameState(gameId: string, state: IGameState): Promise<void> {
        const redisState: IRedisGameState = {
            ...state,
            lastUpdate: Date.now()
        };

        await withLock(gameId, async () => {
            await redisClient
                .multi()
                .set(
                    REDIS_KEYS.GAME_STATE(gameId),
                    JSON.stringify(redisState),
                    'EX',
                    cacheConfig.ttl.gameState
                )
                .publish(REDIS_EVENTS.GAME_STATE_UPDATED, JSON.stringify({ gameId, state: redisState }))
                .exec();
        });
    }

    /**
     * Получает состояние игры
     */
    async getGameState(gameId: string): Promise<IGameState | null> {
        const state = await redisClient.get(REDIS_KEYS.GAME_STATE(gameId));
        if (!state) return null;

        const redisState: IRedisGameState & IGameState = JSON.parse(state);
        // Исключаем служебные поля при возврате
        const { lastUpdate, ...gameState } = redisState as any;
        return gameState;
    }

    /**
     * Обновляет состояние игры после хода
     */
    async updateGameState(
        gameId: string,
        playerNumber: Player,
        serverMove: IServerMove,
        validateMove: boolean = true
    ): Promise<IGameState> {
        return await withLock(gameId, async () => {
            const currentState = await this.getGameState(gameId);
            if (!currentState) {
                throw new Error('Game state not found');
            }

            // Convert IServerMove to GameMove
            const move: GameMove = {
                ...serverMove,
                player: playerNumber,
                timestamp: Date.now()
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
        playerNumber: number
    ): Promise<void> {
        const session: IRedisPlayerSession = {
            gameId,
            playerNumber,
            lastActivity: Date.now()
        };

        await redisClient.setex(
            REDIS_KEYS.PLAYER_SESSION(socketId),
            cacheConfig.ttl.playerSession,
            JSON.stringify(session)
        );
    }

    /**
     * Получает сессию игрока
     */
    async getPlayerSession(socketId: string): Promise<IRedisPlayerSession | null> {
        const session = await redisClient.get(REDIS_KEYS.PLAYER_SESSION(socketId));
        return session ? JSON.parse(session) : null;
    }

    /**
     * Обновляет активность игрока
     */
    async updatePlayerActivity(socketId: string): Promise<void> {
        const session = await this.getPlayerSession(socketId);
        if (session) {
            session.lastActivity = Date.now();
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
    async setGameRoom(gameId: string, players: IPlayer[]): Promise<void> {
        const room: IRedisGameRoom = {
            players,
            status: players.length === 2 ? 'playing' : 'waiting',
            lastUpdate: Date.now()
        };

        await redisClient.setex(
            REDIS_KEYS.GAME_ROOM(gameId),
            cacheConfig.ttl.gameRoom,
            JSON.stringify(room)
        );
    }

    /**
     * Получает информацию об игровой комнате
     */
    async getGameRoom(gameId: string): Promise<IRedisGameRoom | null> {
        const room = await redisClient.get(REDIS_KEYS.GAME_ROOM(gameId));
        return room ? JSON.parse(room) : null;
    }

    /**
     * Добавляет игрока в комнату
     */
    async addPlayerToRoom(gameId: string, player: IPlayer): Promise<void> {
        await withLock(gameId, async () => {
            const room = await this.getGameRoom(gameId);
            if (!room) {
                // Создаем новую комнату
                await this.setGameRoom(gameId, [player]);
            } else if (room.players.length < 2) {
                // Добавляем игрока в существующую комнату
                room.players.push(player);
                room.status = 'playing';
                await this.setGameRoom(gameId, room.players);
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
                room.players = room.players.filter((p: IPlayer) => p.id !== socketId);
                if (room.players.length === 0) {
                    // Если комната пустая, удаляем её
                    await redisClient.del(REDIS_KEYS.GAME_ROOM(gameId));
                } else {
                    room.status = 'waiting';
                    await this.setGameRoom(gameId, room.players);
                }
            }
        });
    }

    /**
     * Добавляет событие в историю игры
     */
    async addGameEvent(event: IRedisGameEvent): Promise<void> {
        const key = REDIS_KEYS.GAME_EVENTS(event.gameId);
        await redisClient
            .multi()
            .lpush(key, JSON.stringify(event))
            .expire(key, cacheConfig.ttl.gameState)
            .exec();
    }

    /**
     * Получает последние события игры
     */
    async getGameEvents(gameId: string, limit: number = 10): Promise<IRedisGameEvent[]> {
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
            .expire(REDIS_KEYS.GAME_STATS, cacheConfig.ttl.gameState)
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
    async createGame(gameId: string, player: IPlayer, initialState: IGameState): Promise<void> {
        await Promise.all([
            this.setGameState(gameId, initialState),
            this.setGameRoom(gameId, [player]),
            this.addActiveGame(gameId)
        ]);
    }

    /**
     * Присоединяет игрока к существующей игре
     */
    async joinGame(gameId: string, player: IPlayer): Promise<void> {
        await this.addPlayerToRoom(gameId, player);
    }

    /**
     * Получает номер текущего игрока из состояния игры
     */
    getCurrentPlayer(state: IGameState): Player {
        return state.currentTurn.moves.length % 2 === 0 ? Player.First : Player.Second;
    }
}

// Экспортируем синглтон
export const redisService = new RedisService();