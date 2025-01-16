/**
 * Common error types and utilities
 */

import { ErrorCategoryEnum, ErrorSeverityEnum } from './enums.js';

/** Basic error details */
export type ErrorDetails = {
    [key: string]: unknown;
};

/** Common error structure */
export type CommonError = {
    code: string;
    message: string;
    category: ErrorCategoryEnum;
    severity: ErrorSeverityEnum;
    timestamp: number;
    details?: ErrorDetails;
    stack?: string;
};

/** Error context */
export type ErrorContext = {
    operation: string;
    component: string;
    input?: unknown;
    metadata?: Record<string, unknown>;
};

/** Error with context */
export type ContextualError = CommonError & {
    context: ErrorContext;
};

/** Error factory options */
export type ErrorOptions = {
    category?: ErrorCategoryEnum;
    severity?: ErrorSeverityEnum;
    details?: ErrorDetails;
    context?: ErrorContext;
};

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