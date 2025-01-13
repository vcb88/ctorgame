// Basic validation result interface
export interface IValidationResult {
    isValid: boolean;
    errors?: string[];
}

// Specific validation results can extend this interface
export interface IValidationResultWithDetails extends IValidationResult {
    details?: Record<string, unknown>;
