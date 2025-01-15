import { PlayerNumber, Position, Size, GameStatus } from './core.js';

// Player type
export type Player = 0 | PlayerNumber;  // 0 for None, 1 or 2 for players

// Position type (reexporting from core)
export type { Position };

// Board size type (reexporting from core)
export type BoardSize = Size;

// Game status type (reexporting from core)
export type { GameStatus };
