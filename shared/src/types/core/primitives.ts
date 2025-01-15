/**
 * Core primitive interfaces that don't depend on any other types
 */

export interface INumeric {
    readonly value: number;
}

export interface IIdentifiable {
    readonly id: string;
}

export interface ITimestamped {
    readonly timestamp: number;
}

export interface IVersioned {
    readonly version: string;
}

export interface IExpiration {
    readonly expiresAt: number;
}

export interface IData<T> {
    readonly data: T;
}

// Basic validation interfaces
export interface IValidatable {
    readonly valid: boolean;
    readonly message?: string;
}