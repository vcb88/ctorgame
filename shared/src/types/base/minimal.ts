/**
 * Minimal base types and interfaces
 */

/** Basic numeric value */
export interface Numeric {
    value: number;
}

/** Basic text value */
export interface Text {
    value: string;
}

/** Basic boolean value */
export interface Flag {
    value: boolean;
}

/** Basic validation */
export interface Validation {
    valid: boolean;
    message?: string;
}

/** Basic metadata */
export interface Metadata {
    [key: string]: unknown;
}

/** Basic identifier */
export interface Identified {
    id: string;
}

/** Basic versioning */
export interface Versioned {
    version: string;
}

/** Basic timing */
export interface Timed {
    timestamp: number;
}

/** Basic expiration */
export interface Expirable {
    expiresAt: number;
}

/** Basic activation */
export interface Activatable {
    active: boolean;
    activatedAt?: number;
    deactivatedAt?: number;
}

/** Basic ordering */
export interface Orderable {
    order: number;
}

/** Basic naming */
export interface Named {
    name: string;
    displayName?: string;
}

/** Basic description */
export interface Described {
    description?: string;
}

/** Basic status */
export interface Statusable {
    status: string;
    statusChangedAt?: number;
}

/** Basic tagging */
export interface Taggable {
    tags?: Array<string>;
}

/** Basic configuration */
export interface Configurable {
    config?: Record<string, unknown>;
}

/** Basic tracking */
export interface Trackable {
    createdAt: number;
    updatedAt: number;
    createdBy?: string;
    updatedBy?: string;
}

/** Basic ownership */
export interface Ownable {
    ownerId: string;
    ownerType?: string;
}