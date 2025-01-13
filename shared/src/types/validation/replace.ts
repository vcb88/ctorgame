import { IValidationResult } from './result.js.js';".js"

export interface IReplaceValidation extends IValidationResult {
    replacements?: Array<[number, number]>;
    message?: string;
