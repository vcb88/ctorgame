export interface LogOptions {
    error?: unknown;
    code?: string;
    severity?: string;
    strategy?: unknown;
    errorCode?: string;
    listenerCount?: number;
    transports?: string[];
    [key: string]: unknown;
}