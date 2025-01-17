import type { PlayerNumber } from '@ctor-game/shared/types/core.js';

export type Timestamp = number;

export interface GameSummary {
    gameCode: string;
    createdAt: Timestamp;
    completedAt?: Timestamp;
    winner: PlayerNumber | null;
}