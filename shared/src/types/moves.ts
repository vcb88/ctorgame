import { Player, IPosition } from './basic-types';

export interface IBasicMove {
    type: 'place' | 'replace' | 'end_turn';
    position: IPosition;
}

export interface IServerMove extends IBasicMove {
    replacements?: Array<[number, number]>;
}

export interface GameMove extends IServerMove {
    player: Player;
    timestamp: number;
}

export interface IReplaceValidation {
    valid: boolean;
    replacements?: Array<[number, number]>;
    message?: string;
}