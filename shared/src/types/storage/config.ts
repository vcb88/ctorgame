/**
 * Storage configuration interface
 */
export interface IStorageConfig {
    readonly prefix: string;
    readonly ttl: number;
    readonly version: string;
}