import { MoveType, Position, ValidationResult } from './core.js';
import type { Player } from './basic-types.js';

// Basic move type
export type Move = {
    readonly type: MoveType;
    readonly position?: Position;
};

// Server move type
export type ServerMove = Move & {
    readonly replacements?: ReadonlyArray<Position>;
};

// Game move type
export type GameMove = ServerMove & {
    readonly player: Player;
    readonly timestamp: number;
};

// Replace validation type
export type ReplaceValidation = ValidationResult & {
    readonly replacements?: ReadonlyArray<Position>;
};
