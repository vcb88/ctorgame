import { IValidationResult } from './result';

export interface IReplaceValidation extends IValidationResult {
    replacements?: Array<[number, number]>;
    message?: string;
}