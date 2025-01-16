export type StorageConfig = {
    /** Storage engine type */
    type: 'redis' | 'memory';
    
    /** Connection configuration */
    connection: {
        host: string;
        port: number;
        password?: string;
        db?: number;
    };
    
    /** Cache configuration */
    cache?: {
        enabled: boolean;
        ttl: number;
    };
    
    /** Backup configuration */
    backup?: {
        enabled: boolean;
        path: string;
        interval: number;
    };
};