import type { ErrorCode, ErrorSeverity } from './errors.js';

export interface BaseError {
    code: ErrorCode;
    message: string;
    category: string;
    severity: ErrorSeverity;
}

export interface NetworkError extends BaseError {
    details?: {
        statusCode?: number;
        url?: string;
        method?: string;
    };
}

export interface NetworkConfig {
    autoConnect: boolean;
    reconnection: boolean;
    reconnectionAttempts: number;
    reconnectionDelay: number;
    reconnectionDelayMax: number;
    forceNew: boolean;
    transports?: string[];
}