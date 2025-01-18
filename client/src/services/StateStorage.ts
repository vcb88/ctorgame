import type { 
    StorageConfig, 
    StoredState,
    StateStorageBase,
    StateStorage 
} from '@ctor-game/shared/types/base/types.js';

/**
 * Implementation of state storage using localStorage
 */
export class StateStorageImpl implements StateStorage {
    private config: Required<StorageConfig>;

    constructor(config: StorageConfig) {
        // Ensure required config values with defaults
        this.config = {
            prefix: config.prefix || 'app',
            ttl: config.ttl || 3600000, // 1 hour default
            version: config.version || '1.0.0',
            metadata: config.metadata || {}
        };
        // Run cleanup on initialization
        this.cleanupExpired().catch(e => console.error('Cleanup failed:', e));
    }

    /**
     * Standardized interface method for getting state
     */
    public async get<T>(key: string): Promise<T | null> {
        return this.loadState<T>(key);
    }

    /**
     * Standardized interface method for setting state
     */
    public async set<T>(key: string, value: T): Promise<void> {
        this.saveState(key, value);
    }

    /**
     * Standardized interface method for deleting state
     */
    public async delete(key: string): Promise<void> {
        this.removeState(key);
    }

    /**
     * Clear all stored states
     */
    public async clear(): Promise<void> {
        const keys = await this.getKeys();
        for (const key of keys) {
            localStorage.removeItem(key);
        }
    }

    /**
     * Get all keys with optional prefix filter
     */
    public async getKeys(prefix?: string): Promise<string[]> {
        const fullPrefix = prefix ? `${this.config.prefix}:${prefix}` : this.config.prefix;
        const keys: string[] = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(fullPrefix)) {
                keys.push(key);
            }
        }

        return keys;
    }

    /**
     * @deprecated Use set() instead
     * Save state with versioning and TTL
     */
    public saveState(key: string, state: unknown): void {
        const storedState: StoredState<unknown> = {
            version: this.config.version,
            timestamp: Date.now(),
            data: state,
            expiresAt: Date.now() + this.config.ttl
        };

        const fullKey = `${this.config.prefix}:${key}`;
        localStorage.setItem(fullKey, JSON.stringify(storedState));
    }

    /**
     * @deprecated Use get() instead
     * Load state if it exists and hasn't expired
     */
    public loadState<T>(key: string): T | null {
        const fullKey = `${this.config.prefix}:${key}`;
        const item = localStorage.getItem(fullKey);
        
        if (!item) {
            return null;
        }

        try {
            const storedState = JSON.parse(item) as StoredState<T>;
            
            // Check if state has expired
            const expiresAt = storedState.expiresAt;
            if (expiresAt && Date.now() > expiresAt) {
                localStorage.removeItem(fullKey);
                return null;
            }

            // Check version mismatch
            if (storedState.version !== this.config.version) {
                // In MVP we just ignore old versions
                localStorage.removeItem(fullKey);
                return null;
            }

            return storedState.data;
        } catch (e) {
            // Handle corrupt data
            localStorage.removeItem(fullKey);
            return null;
        }
    }

    /**
     * @deprecated Use delete() instead
     * Remove state by key
     */
    public removeState(key: string): void {
        const fullKey = `${this.config.prefix}:${key}`;
        localStorage.removeItem(fullKey);
    }

    /**
     * Remove expired states from storage
     */
    public async cleanupExpired(): Promise<void> {
        const keys = await this.getKeys();
        const now = Date.now();

        for (const fullKey of keys) {
            const item = localStorage.getItem(fullKey);
            if (!item) continue;

            try {
                const storedState = JSON.parse(item) as StoredState<unknown>;
                const expiresAt = storedState.expiresAt;
                
                if (expiresAt && now > expiresAt) {
                    localStorage.removeItem(fullKey);
                }
            } catch (e) {
                // Remove corrupt data
                localStorage.removeItem(fullKey);
            }
        }
    }
}