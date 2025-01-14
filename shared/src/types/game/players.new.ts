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

// Re-export type guards
export { isPlayer, isPlayerNumber } from './types.js';