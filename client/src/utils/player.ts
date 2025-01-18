import type { Player, PlayerNumber } from '@ctor-game/shared/types/core.js';

export function createPlayer(number: PlayerNumber | null): Player | null {
    if (number === null) return null;
    return {
        id: `player-${number}`, // Temporary ID for MVP
        number,
        connected: true
    };
}

export function getPlayerNumber(player: Player | null): PlayerNumber | null {
    return player?.number ?? null;
}