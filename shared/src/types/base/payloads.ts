/**
 * Base payload types for events and messages
 */

import type { UUID, Timestamp, Version, Position, Size } from './types';

/** Base payload interface */
export interface BasePayload {
    id: UUID;
    timestamp: Timestamp;
    version: Version;
}

/** Message payload */
export interface MessagePayload extends BasePayload {
    type: string;
    data: unknown;
    metadata?: Record<string, unknown>;
}

/** Error payload */
export interface ErrorPayload extends BasePayload {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}

/** Event payload */
export interface EventPayload extends BasePayload {
    event: string;
    source: string;
    target?: string;
    data?: unknown;
}

/** Command payload */
export interface CommandPayload extends BasePayload {
    command: string;
    params?: Record<string, unknown>;
    context?: Record<string, unknown>;
}

/** Response payload */
export interface ResponsePayload extends BasePayload {
    requestId: UUID;
    status: 'success' | 'error';
    data?: unknown;
    error?: ErrorPayload;
}

/** Game action payload */
export interface GameActionPayload extends BasePayload {
    gameId: UUID;
    playerId: UUID;
    action: {
        type: string;
        position?: Position;
        target?: Position;
        area?: Size;
        value?: number | string;
    };
}

/** Notification payload */
export interface NotificationPayload extends BasePayload {
    type: string;
    title: string;
    message: string;
    level?: 'info' | 'warning' | 'error';
    data?: Record<string, unknown>;
    actions?: Array<{
        label: string;
        action: string;
        data?: unknown;
    }>;
}