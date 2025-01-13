import { IValidationResult } from './result.js';".js"

export interface IReplaceValidation extends IValidationResult {
    replacements?: Array<[number, number]>;
    message?: string;
}
