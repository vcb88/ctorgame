/**
 * Storage related errors
 */

import type { IIdentifiable } from '../core/primitives.js';
import { StorageErrorEnum } from './enums.js';

/** Storage error details */
export interface IStorageErrorDetails extends IIdentifiable {
    readonly key?: string;
    readonly operation: string;
    readonly timestamp: number;
    readonly metadata?: Record<string, unknown>;
}

/** Storage error response */
export interface IStorageError {
    readonly code: StorageErrorEnum;
    readonly message: string;
    readonly details?: IStorageErrorDetails;
}

/** Error factory for common storage errors */
export const createStorageError = (
    code: StorageErrorEnum,
    message: string,
    details?: Partial<IStorageErrorDetails>
): IStorageError => ({
    code,
    message,
    details: details ? {
        id: details.id ?? Date.now().toString(),
        operation: details.operation ?? 'unknown',
        timestamp: details.timestamp ?? Date.now(),
        ...details
    } : undefined
});

/** Predefined storage errors */
export const STORAGE_ERRORS = {
    NOT_FOUND: (key: string) => 
        createStorageError(
            StorageErrorEnum.NOT_FOUND,
            `Item with key "${key}" not found`,
            { key, operation: 'read' }
        ),
    
    ALREADY_EXISTS: (key: string) => 
        createStorageError(
            StorageErrorEnum.ALREADY_EXISTS,
            `Item with key "${key}" already exists`,
            { key, operation: 'write' }
        ),
    
    WRITE_ERROR: (key: string, details?: string) => 
        createStorageError(
            StorageErrorEnum.WRITE_ERROR,
            `Failed to write item with key "${key}"${details ? ': ' + details : ''}`,
            { key, operation: 'write' }
        ),
    
    READ_ERROR: (key: string, details?: string) => 
        createStorageError(
            StorageErrorEnum.READ_ERROR,
            `Failed to read item with key "${key}"${details ? ': ' + details : ''}`,
            { key, operation: 'read' }
        ),
    
    CONNECTION_ERROR: (details: string) => 
        createStorageError(
            StorageErrorEnum.CONNECTION_ERROR,
            `Storage connection error: ${details}`,
            { operation: 'connect' }
        ),
    
    INVALID_KEY: (key: string) => 
        createStorageError(
            StorageErrorEnum.INVALID_KEY,
            `Invalid storage key: "${key}"`,
            { key, operation: 'validate' }
        ),
    
    INVALID_DATA: (key: string, details?: string) => 
        createStorageError(
            StorageErrorEnum.INVALID_DATA,
            `Invalid data for key "${key}"${details ? ': ' + details : ''}`,
            { key, operation: 'validate' }
        )
};