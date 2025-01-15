import type { IPlayer, PlayerNumber, IGameState } from './types.js';

/**
 * Game room information with current state
 */
export interface IGameRoom {
    readonly gameId: string;
    readonly players: ReadonlyArray<IPlayer>;
    readonly currentState: IGameState;
    readonly currentPlayer: PlayerNumber;
}

// Type guards
export const isPlayer = (value: unknown): value is IPlayer => {
    if (!value || typeof value !== 'object') return false;
    const player = value as IPlayer;
    return (
        typeof player.id === 'string' &&
        (player.number === 1 || player.number === 2) &&
        typeof player.connected === 'boolean'
    );
};

export const isPlayerNumber = (value: unknown): value is PlayerNumber => {
    return typeof value === 'number' && (value === 1 || value === 2);
};