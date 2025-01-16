/**
 * Base error types and utilities
 */

import { ErrorCategoryEnum, ErrorSeverityEnum } from '../common/enums.js';

/** Base error codes */
export enum BaseErrorEnum {
    // Validation errors
    INVALID_INPUT = 'invalid_input',
    INVALID_FORMAT = 'invalid_format',
    REQUIRED_FIELD = 'required_field',
    VALUE_TOO_SHORT = 'value_too_short',
    VALUE_TOO_LONG = 'value_too_long',
    VALUE_OUT_OF_RANGE = 'value_out_of_range',
    
    // Operation errors
    OPERATION_FAILED = 'operation_failed',
    OPERATION_TIMEOUT = 'operation_timeout',
    OPERATION_CANCELLED = 'operation_cancelled',
    OPERATION_NOT_SUPPORTED = 'operation_not_supported',
    
    // State errors
    INVALID_STATE = 'invalid_state',
    STATE_TRANSITION = 'state_transition',
    STATE_CONFLICT = 'state_conflict',
    
    // Resource errors
    NOT_FOUND = 'not_found',
    ALREADY_EXISTS = 'already_exists',
    ACCESS_DENIED = 'access_denied',
    QUOTA_EXCEEDED = 'quota_exceeded',
    
    // System errors
    INTERNAL_ERROR = 'internal_error',
    CONFIGURATION_ERROR = 'configuration_error',
    DEPENDENCY_ERROR = 'dependency_error',
    VERSION_MISMATCH = 'version_mismatch'
}

/** Error with metadata */
export interface BaseError {
    readonly code: BaseErrorEnum;
    readonly message: string;
    readonly category: ErrorCategoryEnum;
    readonly severity: ErrorSeverityEnum;
    readonly timestamp: number;
    readonly details?: Record<string, unknown>;
    readonly stack?: string;
}

/** Error factory options */
export interface ErrorOptions {
    readonly category?: ErrorCategoryEnum;
    readonly severity?: ErrorSeverityEnum;
    readonly details?: Record<string, unknown>;
}

/** Create error with defaults */
export function createError(
    code: BaseErrorEnum,
    message: string,
    options: ErrorOptions = {}
): BaseError {
    return {
        code,
        message,
        category: options.category ?? ErrorCategoryEnum.SYSTEM,
        severity: options.severity ?? ErrorSeverityEnum.ERROR,
        timestamp: Date.now(),
        details: options.details
    };
}

/** Predefined errors */
export const ERRORS = {
    NOT_FOUND: (resource: string) => 
        createError(
            BaseErrorEnum.NOT_FOUND,
            `${resource} not found`,
            { category: ErrorCategoryEnum.BUSINESS }
        ),
    
    INVALID_INPUT: (field: string, reason: string) =>
        createError(
            BaseErrorEnum.INVALID_INPUT,
            `Invalid ${field}: ${reason}`,
            { category: ErrorCategoryEnum.VALIDATION }
        ),
    
    OPERATION_FAILED: (operation: string, reason: string) =>
        createError(
            BaseErrorEnum.OPERATION_FAILED,
            `Operation ${operation} failed: ${reason}`
        ),
    
    INTERNAL_ERROR: (details: string) =>
        createError(
            BaseErrorEnum.INTERNAL_ERROR,
            `Internal error: ${details}`,
            { severity: ErrorSeverityEnum.CRITICAL }
        )
};