import { StorageConfig, StoredState, IStateStorage } from '../../../shared/types/state_storage';

/**
 * Implementation of state storage using localStorage
 */
export class StateStorage implements IStateStorage {
    private config: StorageConfig;

    constructor(config: StorageConfig) {
        this.config = config;
        // Run cleanup on initialization
        this.cleanupExpired();
    }

    /**
     * Save state with versioning and TTL
     */
    public saveState(key: string, state: any): void {
        const storedState: StoredState<any> = {
            version: this.config.version,
            timestamp: Date.now(),
            data: state,
            expiresAt: Date.now() + this.config.ttl
        };

        const fullKey = `${this.config.prefix}:${key}`;
        localStorage.setItem(fullKey, JSON.stringify(storedState));
    }

    /**
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
            if (Date.now() > storedState.expiresAt) {
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
     * Remove expired states from storage
     */
    public cleanupExpired(): void {
        const keys = this.getKeys();
        const now = Date.now();

        keys.forEach(fullKey => {
            const item = localStorage.getItem(fullKey);
            if (!item) return;

            try {
                const storedState = JSON.parse(item) as StoredState<any>;
                if (now > storedState.expiresAt) {
                    localStorage.removeItem(fullKey);
                }
            } catch (e) {
                // Remove corrupt data
                localStorage.removeItem(fullKey);
            }
        });
    }

    /**
     * Remove state by key
     */
    public removeState(key: string): void {
        const fullKey = `${this.config.prefix}:${key}`;
        localStorage.removeItem(fullKey);
    }

    /**
     * Get all keys with optional prefix filter
     */
    public getKeys(prefix?: string): string[] {
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
}