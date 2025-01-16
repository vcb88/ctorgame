/**
 * Common error types and utilities
 */

import { ErrorCategoryEnum, ErrorSeverityEnum } from './enums.js';

/** Basic error details */
export interface ErrorDetails {
    readonly [key: string]: unknown;
}

/** Common error structure */
export interface CommonError {
    readonly code: string;
    readonly message: string;
    readonly category: ErrorCategoryEnum;
    readonly severity: ErrorSeverityEnum;
    readonly timestamp: number;
    readonly details?: ErrorDetails;
    readonly stack?: string;
}

/** Error with context */
export interface ContextualError extends CommonError {
    readonly context: {
        readonly operation: string;
        readonly component: string;
        readonly input?: unknown;
        readonly metadata?: Record<string, unknown>;
    };
}

/** Error factory options */
export interface ErrorOptions {
    readonly category?: ErrorCategoryEnum;
    readonly severity?: ErrorSeverityEnum;
    readonly details?: ErrorDetails;
    readonly context?: ContextualError['context'];
}

/** Create error with defaults */
export const createError = (
    code: string,
    message: string,
    options: ErrorOptions = {}
): CommonError => ({
    code,
    message,
    category: options.category ?? ErrorCategoryEnum.SYSTEM,
    severity: options.severity ?? ErrorSeverityEnum.ERROR,
    timestamp: Date.now(),
    details: options.details,
    ...(options.context ? { context: options.context } : {})
});

/** Type guard for CommonError */
export const isCommonError = (error: unknown): error is CommonError => {
    if (!error || typeof error !== 'object') return false;
    
    const e = error as Partial<CommonError>;
    return typeof e.code === 'string' &&
           typeof e.message === 'string' &&
           typeof e.timestamp === 'number' &&
           e.category !== undefined &&
           e.severity !== undefined;
};