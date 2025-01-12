// Re-export base types
export {
    Player,
    GamePhase,
    GameOutcome,
    IPosition,
    IBoardSize,
    IBoard,
    BOARD_SIZE,
    MIN_ADJACENT_FOR_REPLACE,
    MAX_PLACE_OPERATIONS
} from './base.js';

// Re-export game types
export {
    OperationType,
    IGameMove,
    IReplaceValidation,
    GameManagerState,
    ITurnState,
    IScores,
    IGameState
} from './game.js';

// Re-export player types
export {
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