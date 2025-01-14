/**
 * Player number type (1 or 2)
 */
export type PlayerNumber = 1 | 2;

/**
 * Player information
 */
export interface IPlayer {
    readonly id: string;
    readonly number: PlayerNumber;
}

/**
 * Game room information
 */
export interface IGameRoom {
    readonly gameId: string;
    readonly players: ReadonlyArray<IPlayer>;
    readonly currentState: import('./state').IGameState;
    readonly currentPlayer: PlayerNumber;
}

/**
 * Type guard for PlayerNumber
 */
export function isPlayerNumber(value: unknown): value is PlayerNumber {
    return typeof value === 'number' && (value === 1 || value === 2);
}

/**
 * Type guard for IPlayer
 */
export function isPlayer(value: unknown): value is IPlayer {
    if (!value || typeof value !== 'object') return false;
    const player = value as IPlayer;
    return (
        typeof player.id === 'string' &&
        isPlayerNumber(player.number)
    );
}