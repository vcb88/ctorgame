/**
 * Common utility types
 */

import type { Position, Size } from '../core/primitives.js';

/** Re-export core geometric types */
export type { Position, Size };

/** Time range */
export type TimeRange = {
    start: number;
    end: number;
};

/** Identifiable entity */
export type Identifiable = {
    id: string;
};

/** Versioned entity */
export type Versioned = {
    version: string;
};

/** Timestamped entity */
export type Timestamped = {
    timestamp: number;
};

/** Metadata container */
export type WithMetadata = {
    metadata: Record<string, unknown>;
};

/** Paginated result */
export type Paginated<T> = {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
};

/** Filter operators */
export type FilterOperator = 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'nin' | 'like';

/** Filter criteria */
export type FilterCriteria = {
    field: string;
    operator: FilterOperator;
    value: unknown;
};

/** Sort direction */
export type SortDirection = 'asc' | 'desc';

/** Sort criteria */
export type SortCriteria = {
    field: string;
    direction: SortDirection;
};

/** Query options */
export type QueryOptions = {
    filters?: FilterCriteria[];
    sort?: SortCriteria[];
    page?: number;
    pageSize?: number;
    fields?: string[];
};

/** Cache options */
export type CacheOptions = {
    ttl?: number;
    refresh?: boolean;
    namespace?: string;
};

/** Board-specific types */
export type BoardPosition = {
    position: Position;
    valid: boolean; // Indicates if position is within board bounds
};

export type BoardCell = {
    position: Position;
    value: number | null;
};

/** Type guards */
export const isValidPosition = (pos: Position, size: Size): boolean => {
    return pos[0] >= 0 && pos[0] < size[0] && pos[1] >= 0 && pos[1] < size[1];
};