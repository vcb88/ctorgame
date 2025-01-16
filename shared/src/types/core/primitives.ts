/**
 * Core primitive types
 */

/** Basic numeric types */
export type Timestamp = number;
export type UUID = string;
export type Version = string;

/** Player number (1 or 2) */
export type PlayerNumber = 1 | 2;

/** Position coordinates */
export interface Position {
    readonly x: number;
    readonly y: number;
}

/** Size dimensions */
export interface Size {
    readonly width: number;
    readonly height: number;
}

/** Scores [player1, player2] */
export type Scores = readonly [number, number];

/** Game cell value - player number or empty */
export type CellValue = PlayerNumber | null;

/** Basic validation result */
export interface ValidationResult {
    readonly valid: boolean;
    readonly message?: string;
}

/** Collection type */
export type Collection<T> = ReadonlyArray<T>;

/** Metadata wrapper */
export interface WithMetadata<T> {
    readonly data: T;
    readonly timestamp: Timestamp;
    readonly version?: Version;
}