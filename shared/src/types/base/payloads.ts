/**
 * Base payload types for events and messages
 */

import type { UUID, Timestamp, Version } from '../core/primitives.js';
import type { Position, Size } from '../core/primitives.js';

/** Base payload interface */
export interface BasePayload {
    readonly id: UUID;
    readonly timestamp: Timestamp;
    readonly version: Version;
}

/** Message payload */
export interface MessagePayload extends BasePayload {
    readonly type: string;
    readonly data: unknown;
    readonly metadata?: Record<string, unknown>;
}

/** Error payload */
export interface ErrorPayload extends BasePayload {
    readonly code: string;
    readonly message: string;
    readonly details?: Record<string, unknown>;
}

/** Event payload */
export interface EventPayload extends BasePayload {
    readonly event: string;
    readonly source: string;
    readonly target?: string;
    readonly data?: unknown;
}

/** Command payload */
export interface CommandPayload extends BasePayload {
    readonly command: string;
    readonly params?: Record<string, unknown>;
    readonly context?: Record<string, unknown>;
}

/** Response payload */
export interface ResponsePayload extends BasePayload {
    readonly requestId: UUID;
    readonly status: 'success' | 'error';
    readonly data?: unknown;
    readonly error?: ErrorPayload;
}

/** Game action payload */
export interface GameActionPayload extends BasePayload {
    readonly gameId: UUID;
    readonly playerId: UUID;
    readonly action: {
        readonly type: string;
        readonly position?: Position;
        readonly target?: Position;
        readonly area?: Size;
        readonly value?: number | string;
    };
}

/** Notification payload */
export interface NotificationPayload extends BasePayload {
    readonly type: string;
    readonly title: string;
    readonly message: string;
    readonly level?: 'info' | 'warning' | 'error';
    readonly data?: Record<string, unknown>;
    readonly actions?: Array<{
        readonly label: string;
        readonly action: string;
        readonly data?: unknown;
    }>;
}