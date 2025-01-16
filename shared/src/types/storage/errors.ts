import type { GameError } from '../core.js';

export type StorageErrorDetails = {
    id: string;
    path?: string;
    key?: string;
    operation?: string;
};

export type StorageError = GameError & {
    code: 'STORAGE_ERROR';
    details?: StorageErrorDetails;
};