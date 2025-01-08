import Redis from 'ioredis';
import * as dotenv from 'dotenv';
import { ICacheConfig } from '@ctor-game/shared/types';

dotenv.config();

// Конфигурация TTL из переменных окружения или значений по умолчанию
export const cacheConfig: ICacheConfig = {
    ttl: {
        gameState: parseInt(process.env.CACHE_TTL_GAME_STATE || '3600'),
        playerSession: parseInt(process.env.CACHE_TTL_PLAYER_SESSION || '7200'),
        gameRoom: parseInt(process.env.CACHE_TTL_GAME_ROOM || '3600')
    }
};

// Создаем инстанс Redis с настройками подключения
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
export const redisClient = new Redis({
    host: new URL(redisUrl).hostname,
    port: parseInt(new URL(redisUrl).port || '6379'),
    username: new URL(redisUrl).username || undefined,
    password: new URL(redisUrl).password || undefined,
    retryStrategy: (times: number) => {
        const maxRetryTime = 3000; // Максимальное время ожидания - 3 секунды
        const delay = Math.min(times * 500, maxRetryTime);
        console.log(`Redis retry attempt ${times}, delay ${delay}ms`);
        return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    maxLoadingRetryTime: 5000, // Максимальное время для повторных попыток загрузки
    reconnectOnError: (err: Error) => {
        console.error('Redis connection error:', err);
        return true; // Всегда пытаемся переподключиться
    },
});

// Функция для подключения к Redis
export const connectRedis = async (): Promise<void> => {
    try {
        console.log('Connecting to Redis at', process.env.REDIS_URL || 'redis://localhost:6379');
        await redisClient.ping();
        console.log('Redis connected successfully');
    } catch (error) {
        console.error('Redis connection error:', error);
        throw error;
    }
};

// Константы для ключей Redis с функцией для форматирования
export const REDIS_KEYS = {
    // Ключи для игровых данных
    GAME_STATE: (gameId: string) => `game:${gameId}:state`,
    GAME_ROOM: (gameId: string) => `game:${gameId}:room`,
    GAME_EVENTS: (gameId: string) => `game:${gameId}:events`,
    
    // Ключи для пользовательских сессий
    PLAYER_SESSION: (socketId: string) => `player:${socketId}:session`,
    
    // Ключи для списков и статистики
    ACTIVE_GAMES: 'games:active',
    GAME_STATS: 'games:stats',
    
    // Ключи для блокировок
    GAME_LOCK: (gameId: string) => `game:${gameId}:lock`,
} as const;

// Вспомогательные функции для работы с Redis

/**
 * Получить блокировку для операций с игрой
 * @param gameId ID игры
 * @param timeout Время ожидания блокировки в мс
 * @returns true если блокировка получена, false если нет
 */
export async function acquireLock(gameId: string, timeout = 5000): Promise<boolean> {
    const key = REDIS_KEYS.GAME_LOCK(gameId);
    const lockValue = Date.now().toString();
    
    // Пытаемся установить блокировку с помощью SET NX и TTL
    // Используем SET с опциями в виде строки команды
    const acquired = await redisClient.set(
        key,
        lockValue,
        'EX',
        Math.ceil(timeout / 1000)
    );
    return acquired === 'OK';
}

/**
 * Освободить блокировку
 * @param gameId ID игры
 */
export async function releaseLock(gameId: string): Promise<void> {
    const key = REDIS_KEYS.GAME_LOCK(gameId);
    await redisClient.del(key);
}

/**
 * Выполнить операцию с блокировкой
 * @param gameId ID игры
 * @param operation Операция для выполнения
 * @param timeout Время ожидания блокировки
 */
export async function withLock<T>(
    gameId: string, 
    operation: () => Promise<T>, 
    timeout = 5000
): Promise<T> {
    const locked = await acquireLock(gameId, timeout);
    if (!locked) {
        throw new Error('Could not acquire lock');
    }
    
    try {
        return await operation();
    } finally {
        await releaseLock(gameId);
    }
}

// События Redis для публикации/подписки
export const REDIS_EVENTS = {
    GAME_STATE_UPDATED: 'game:state:updated',
    PLAYER_CONNECTED: 'player:connected',
    PLAYER_DISCONNECTED: 'player:disconnected',
    GAME_OVER: 'game:over'
} as const;

// Обработка ошибок Redis
redisClient.on('error', (error) => {
    console.error('Redis client error:', error);
});

redisClient.on('connect', () => {
    console.log('Redis client connected');
});

redisClient.on('reconnecting', () => {
    console.log('Redis client reconnecting');
});

export default redisClient;