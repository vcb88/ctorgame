/**
 * Common enumerations used across the application
 */

/** Error categories */
export enum ErrorCategoryEnum {
    // Core categories
    SYSTEM = 'system',
    BUSINESS = 'business',
    VALIDATION = 'validation',
    SECURITY = 'security',

    // Specific domains
    GAME = 'game',
    NETWORK = 'network',
    STORAGE = 'storage'
}

/** Error severity levels */
export enum ErrorSeverityEnum {
    DEBUG = 'debug',         // Diagnostic information
    INFO = 'info',          // Normal operations
    WARNING = 'warning',     // Potential issues
    ERROR = 'error',        // Recoverable errors
    CRITICAL = 'critical'   // System-threatening errors
}

/** Common status enum */
export enum StatusEnum {
    // Basic statuses
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed',
    
    // Process statuses
    INITIALIZING = 'initializing',
    PROCESSING = 'processing',
    VALIDATING = 'validating',
    SAVING = 'saving',
    
    // Special statuses
    UNKNOWN = 'unknown',
    DEPRECATED = 'deprecated',
    MAINTENANCE = 'maintenance'
}

/** Operation result status */
export enum ResultStatusEnum {
    SUCCESS = 'success',
    FAILURE = 'failure',
    PARTIAL = 'partial',
    PENDING = 'pending',
    CANCELLED = 'cancelled'
}

/** Time periods */
export enum TimePeriodEnum {
    SECOND = 1,
    MINUTE = 60,
    HOUR = 3600,
    DAY = 86400,
    WEEK = 604800
}