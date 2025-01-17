/**
 * State types exports
 */

// Core functionality
export * from './enums.js';
export * from './board.js';
export * from './moves.js';
export * from './game.js';
export * from './storage.js';
export * from './manager.js';

// Legacy types
import type { Board, BoardCell } from './board.js';
import type { Move, GameMove, TurnState } from './moves.js';
import type { GameState, GameSettings } from './game.js';
import type { StoredState, StateStorage } from './storage.js';
import type { StateManager, ManagerState } from './manager.js';

// Legacy exports
export type {
    Board as IBoard,
    BoardCell as IBoardCell,
    Move as IMove,
    GameMove as IGameMove,
    TurnState as ITurnState,
    GameState as GameState,
    // GameScores removed as it's replaced by Scores from primitives
    GameSettings as IGameSettings,
    StoredState as IStoredState,
    StateStorage as IStateStorage,
    StateManager as IStateManager,
    ManagerState as IManagerState
};