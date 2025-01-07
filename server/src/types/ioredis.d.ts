declare module 'ioredis' {
    export interface RedisOptions {
        host?: string;
        port?: number;
        username?: string;
        password?: string;
        retryStrategy?: (times: number) => number | void;
        maxRetriesPerRequest?: number;
        enableReadyCheck?: boolean;
        maxLoadingRetryTime?: number;
    }

    export interface RedisKey {
        toString(): string;
    }

    export type RedisValue = string | number | Buffer;

    export interface Pipeline {
        exec(): Promise<[Error | null, any][]>;
        set(key: RedisKey, value: RedisValue, mode?: string, duration?: number): Pipeline;
        get(key: RedisKey): Pipeline;
        del(...keys: RedisKey[]): Pipeline;
        expire(key: RedisKey, seconds: number): Pipeline;
        lpush(key: RedisKey, ...values: RedisValue[]): Pipeline;
        publish(channel: string, message: string): Pipeline;
        hset(key: RedisKey, field: RedisKey, value: RedisValue): Pipeline;
        multi(): Pipeline;
    }

    export default class Redis {
        constructor(options?: RedisOptions);
        
        connect(): Promise<void>;
        ping(): Promise<string>;
        set(key: RedisKey, value: RedisValue, mode?: string, duration?: number): Promise<string>;
        get(key: RedisKey): Promise<string | null>;
        del(...keys: RedisKey[]): Promise<number>;
        expire(key: RedisKey, seconds: number): Promise<number>;
        setex(key: RedisKey, seconds: number, value: RedisValue): Promise<string>;
        lpush(key: RedisKey, ...values: RedisValue[]): Promise<number>;
        lrange(key: RedisKey, start: number, stop: number): Promise<string[]>;
        hset(key: RedisKey, field: RedisKey, value: RedisValue): Promise<number>;
        hget(key: RedisKey, field: RedisKey): Promise<string | null>;
        sadd(key: RedisKey, ...members: RedisValue[]): Promise<number>;
        srem(key: RedisKey, ...members: RedisValue[]): Promise<number>;
        smembers(key: RedisKey): Promise<string[]>;
        multi(): Pipeline;
        publish(channel: string, message: string): Promise<number>;
        on(event: string, listener: (...args: any[]) => void): this;
        disconnect(): void;
    }
}