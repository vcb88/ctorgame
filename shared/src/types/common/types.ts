/**
 * Common utility types
 */

import type { Position, Size } from '../core/primitives.js';

/** Re-export core geometric types */
export type { Position, Size };

/** Time range */
export interface TimeRange {
    readonly start: number;
    readonly end: number;
}

/** Identifiable entity */
export interface Identifiable {
    readonly id: string;
}

/** Versioned entity */
export interface Versioned {
    readonly version: string;
}

/** Timestamped entity */
export interface Timestamped {
    readonly timestamp: number;
}

/** Metadata container */
export interface WithMetadata {
    readonly metadata: Record<string, unknown>;
}

/** Paginated result */
export interface Paginated<T> {
    readonly items: T[];
    readonly total: number;
    readonly page: number;
    readonly pageSize: number;
    readonly hasMore: boolean;
}

/** Filter criteria */
export interface FilterCriteria {
    readonly field: string;
    readonly operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'nin' | 'like';
    readonly value: unknown;
}

/** Sort criteria */
export interface SortCriteria {
    readonly field: string;
    readonly direction: 'asc' | 'desc';
}

/** Query options */
export interface QueryOptions {
    readonly filters?: FilterCriteria[];
    readonly sort?: SortCriteria[];
    readonly page?: number;
    readonly pageSize?: number;
    readonly fields?: string[];
}

/** Cache options */
export interface CacheOptions {
    readonly ttl?: number;
    readonly refresh?: boolean;
    readonly namespace?: string;
}

/** Board-specific types moved from geometric types */
export interface BoardPosition {
    readonly position: Position;
    readonly valid: boolean; // Indicates if position is within board bounds
}

export interface BoardCell {
    readonly position: Position;
    readonly value: number | null;
}

/** Type guards */
export const isValidPosition = (pos: Position, size: Size): boolean => {
    return pos.x >= 0 && pos.x < size.width && pos.y >= 0 && pos.y < size.height;
};