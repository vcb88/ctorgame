import type { ValidationError as IValidationError } from "../types/base/types.js";

export class ValidationError extends Error implements IValidationError {
    readonly category: "validation" = "validation";
    readonly code: "VALIDATION_ERROR" = "VALIDATION_ERROR";
    readonly severity: "error" = "error";
    readonly field?: string;
    readonly timestamp: number = Date.now();
    readonly errors: string[] = [];
    readonly details?: {
        reason?: string;
        code?: string;
    };

    constructor(message: string, field?: string) {
        super(message);
        this.name = "ValidationError";
        this.field = field;
    }
}
