/**
 * Common result types
 */

import { ResultStatusEnum } from './enums.js';
import type { CommonError } from './errors.js';

/** Operation result with data */
export type OperationResult<T = unknown, E = CommonError> = {
    status: ResultStatusEnum;
    data?: T;
    error?: E;
    timestamp: number;
    metadata?: Record<string, unknown>;
};

/** Validation result with details */
export type ValidationResult = {
    valid: boolean;
    errors?: CommonError[];
    warnings?: string[];
    metadata?: Record<string, unknown>;
};

/** Batch operation result */
export type BatchResult<T = unknown> = {
    total: number;
    successful: number;
    failed: number;
    results: OperationResult<T>[];
    timestamp: number;
};

/** Type guards */
export const isSuccessful = <T>(result: OperationResult<T>): result is OperationResult<T> & { data: T } =>
    result.status === ResultStatusEnum.SUCCESS && result.data !== undefined;

export const isFailed = <T, E>(result: OperationResult<T, E>): result is OperationResult<T, E> & { error: E } =>
    result.status === ResultStatusEnum.FAILURE && result.error !== undefined;