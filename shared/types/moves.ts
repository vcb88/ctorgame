import { Player, IPosition } from './base';

export interface IBasicMove {
    type: 'place' | 'replace';
    position: IPosition;
}

export interface GameMove extends IBasicMove {
    player: Player;
    timestamp: number;
    replacements?: Array<[number, number]>;
}

export interface IReplaceValidation {
    valid: boolean;
    replacements?: Array<[number, number]>;
    message?: string;
}