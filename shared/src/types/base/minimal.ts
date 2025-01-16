/**
 * Minimal base types and interfaces
 */

/** Basic numeric value */
export interface Numeric {
    readonly value: number;
}

/** Basic text value */
export interface Text {
    readonly value: string;
}

/** Basic boolean value */
export interface Flag {
    readonly value: boolean;
}

/** Basic validation */
export interface Validation {
    readonly valid: boolean;
    readonly message?: string;
}

/** Basic metadata */
export interface Metadata {
    readonly [key: string]: unknown;
}

/** Basic identifier */
export interface Identified {
    readonly id: string;
}

/** Basic versioning */
export interface Versioned {
    readonly version: string;
}

/** Basic timing */
export interface Timed {
    readonly timestamp: number;
}

/** Basic expiration */
export interface Expirable {
    readonly expiresAt: number;
}

/** Basic activation */
export interface Activatable {
    readonly active: boolean;
    readonly activatedAt?: number;
    readonly deactivatedAt?: number;
}

/** Basic ordering */
export interface Orderable {
    readonly order: number;
}

/** Basic naming */
export interface Named {
    readonly name: string;
    readonly displayName?: string;
}

/** Basic description */
export interface Described {
    readonly description?: string;
}

/** Basic status */
export interface Statusable {
    readonly status: string;
    readonly statusChangedAt?: number;
}

/** Basic tagging */
export interface Taggable {
    readonly tags?: ReadonlyArray<string>;
}

/** Basic configuration */
export interface Configurable {
    readonly config?: Record<string, unknown>;
}

/** Basic tracking */
export interface Trackable {
    readonly createdAt: number;
    readonly updatedAt: number;
    readonly createdBy?: string;
    readonly updatedBy?: string;
}

/** Basic ownership */
export interface Ownable {
    readonly ownerId: string;
    readonly ownerType?: string;
}