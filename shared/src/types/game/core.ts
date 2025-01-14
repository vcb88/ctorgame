/**
 * Core game types using composition
 * All game-related types should be defined here
 */

import type {
    IPosition,
    ISize,
    IIdentifiable,
    ITimestamped,
    GameStatus,
    OperationType,
    PlayerNumber,
    IScores,
    UUID
} from '../core/base.js';

// Player type using composition
export interface IPlayer {
    id: UUID;
    number: PlayerNumber;
    connected: boolean;
}

// Game move using composition instead of inheritance
export interface IGameMove {
    type: OperationType;
    position: IPosition;
    player: PlayerNumber;
    timestamp: Timestamp;
}

// Turn state using composition
export interface ITurnState {
    currentPlayer: PlayerNumber;
    placeOperationsLeft: number;
    moves: IGameMove[];
}

// Game state using composition
export interface IGameState {
    id: UUID;
    board: Array<Array<number | null>>;
    size: ISize;
    turn: ITurnState;
    scores: IScores;
    status: GameStatus;
    timestamp: Timestamp;
    isFirstTurn: boolean;
}

// Move validation result
export interface IMoveValidation extends IValidationResult {
    captures?: IPosition[];
}

// For Redis storage
export interface IStoredGameState extends IGameState {
    lastUpdate: Timestamp;
    expiresAt: Timestamp;
}