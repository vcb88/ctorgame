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
    x: number;
    y: number;
}

/** Size dimensions */
export interface Size {
    width: number;
    height: number;
}

/** Scores [player1, player2] */
export type Scores = [number, number];

/** Game cell value - player number or empty */
export type CellValue = PlayerNumber | null;

/** Basic validation result */
export interface ValidationResult {
    valid: boolean;
    message?: string;
}

/** Collection type */
export type Collection<T> = Array<T>;

/** Metadata wrapper */
export interface WithMetadata<T> {
    data: T;
    timestamp: Timestamp;
    version?: Version;
}