/**
 * Common result types
 */

import { ResultStatusEnum } from './enums.js';
import type { CommonError } from './errors.js';

/** Operation result with data */
export interface OperationResult<T = unknown, E = CommonError> {
    readonly status: ResultStatusEnum;
    readonly data?: T;
    readonly error?: E;
    readonly timestamp: number;
    readonly metadata?: Record<string, unknown>;
}

/** Validation result with details */
export interface ValidationResult {
    readonly valid: boolean;
    readonly errors?: CommonError[];
    readonly warnings?: string[];
    readonly metadata?: Record<string, unknown>;
}

/** Batch operation result */
export interface BatchResult<T = unknown> {
    readonly total: number;
    readonly successful: number;
    readonly failed: number;
    readonly results: OperationResult<T>[];
    readonly timestamp: number;
}

/** Type guards */
export const isSuccessful = <T>(result: OperationResult<T>): result is OperationResult<T> & { data: T } =>
    result.status === ResultStatusEnum.SUCCESS && result.data !== undefined;

export const isFailed = <T, E>(result: OperationResult<T, E>): result is OperationResult<T, E> & { error: E } =>
    result.status === ResultStatusEnum.FAILURE && result.error !== undefined;