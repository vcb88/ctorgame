/** Basic storage configuration */
export type StorageConfig = {
    version: string;
    prefix: string;
    ttl: number;
};

/** Stored state with metadata */
export type StoredState<T> = {
    version: string;
    timestamp: number;
    data: T;
    expiresAt: number;
};

/** Storage interface */
export type StateStorage = {
    saveState(key: string, state: any): void;
    loadState<T>(key: string): T | null;
    removeState(key: string): void;
    cleanupExpired(): void;
    getKeys(prefix?: string): string[];
};