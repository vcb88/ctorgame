import { MoveType, Position, ValidationResult } from './core.js';
import type { Player } from './basic-types.js';

// Basic move type
export type Move = {
    type: MoveType;
    position?: Position;
};

// Server move type
export type ServerMove = Move & {
    replacements?: Array<Position>;
};

// Game move type
export type GameMove = ServerMove & {
    player: Player;
    timestamp: number;
};

// Replace validation type
export type ReplaceValidation = ValidationResult & {
    replacements?: Array<Position>;
};
