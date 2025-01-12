// Re-export base types and enums
export {
    Player,
    GamePhase,
    GameOutcome,
    BOARD_SIZE,
    MIN_ADJACENT_FOR_REPLACE,
    MAX_PLACE_OPERATIONS
} from './base.js';

// Re-export base interfaces
export type {
    IPosition,
    IBoardSize,
    IBoard
} from './base.js';

// Re-export game enum
export {
    OperationType
} from './game.js';

// Re-export game interfaces
export type {
    IGameMove,
    IReplaceValidation,
    GameManagerState,
    ITurnState,
    IScores,
    IGameState
} from './game.js';

// Re-export player interfaces
export type {
    IPlayer,
    IGameRoom
} from './player.js';

// Re-export domain-specific types
export * from './errors.js';
export * from './actions.js';
export * from './websocket.js';
export * from './replay.js';
export * from './redis.js';
export * from './events.js';
export * from './storage.js';
export * from './state_storage.js';
export * from './ai.js';