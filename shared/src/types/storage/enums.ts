/**
 * Storage related enumerations
 */

/** Storage backend types */
export enum StorageTypeEnum {
    MEMORY = 'memory',    // In-memory storage (for testing and development)
    REDIS = 'redis',      // Redis storage (primary production backend)
    FILE = 'file'         // File-based storage (for debugging and backups)
}

/** Storage operations */
export enum StorageOperationEnum {
    READ = 'read',          // Read single item
    WRITE = 'write',        // Write/update single item
    DELETE = 'delete',      // Delete single item
    LIST = 'list',          // List items (with optional pattern)
    EXISTS = 'exists',      // Check if item exists
    CLEAR = 'clear',        // Clear all items
    BACKUP = 'backup',      // Create backup
    RESTORE = 'restore'     // Restore from backup
}

/** Storage error types */
export enum StorageErrorEnum {
    // Data errors
    NOT_FOUND = 'not_found',                // Item not found
    ALREADY_EXISTS = 'already_exists',       // Item already exists
    INVALID_KEY = 'invalid_key',            // Invalid key format/structure
    INVALID_DATA = 'invalid_data',          // Invalid data format/structure
    
    // Operation errors
    WRITE_ERROR = 'write_error',            // Failed to write data
    READ_ERROR = 'read_error',              // Failed to read data
    DELETE_ERROR = 'delete_error',          // Failed to delete data
    
    // Connection/system errors
    CONNECTION_ERROR = 'connection_error',   // Connection to storage failed
    INITIALIZATION_ERROR = 'init_error',     // Failed to initialize storage
    BACKUP_ERROR = 'backup_error',          // Failed to create/restore backup
    
    // Other errors
    OPERATION_TIMEOUT = 'timeout',          // Operation timed out
    QUOTA_EXCEEDED = 'quota_exceeded',      // Storage quota exceeded
    VERSION_MISMATCH = 'version_mismatch'   // Data version mismatch
}