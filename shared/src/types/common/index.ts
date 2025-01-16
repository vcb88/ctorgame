/**
 * Common types used across the application
 */

// Core functionality
export * from './enums.js';
export * from './errors.js';
export * from './result.js';
export * from './types.js';

// Legacy types
import type { Position, Size } from '../core/primitives.js';
import type { CommonError } from './errors.js';
import type { OperationResult, ValidationResult } from './result.js';
import type { 
    TimeRange, 
    Identifiable, 
    Timestamped,
    BoardPosition,
    BoardCell
} from './types.js';

export type {
    Position as IPosition,
    Size as ISize,
    CommonError as IError,
    OperationResult as IOperationResult,
    ValidationResult as IValidationResult,
    TimeRange as ITimeRange,
    Identifiable as IIdentifiable,
    Timestamped as ITimestamped,
    BoardPosition as IBoardPosition,
    BoardCell as IBoardCell
};