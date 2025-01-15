import type {
    PlayerNumber,
    GameState,
    GameMove,
    GameError,
    GameId
} from '@ctor-game/shared/src/types/core.js';

/**
 * Game manager state type
 * Contains all necessary information about current game state
 */
export type GameManagerState = {
    /** Current game state */
    gameState: GameState | null;
    /** Current player */
    currentPlayer: PlayerNumber | null;
    /** Available replace moves for current turn */
    availableReplaces: GameMove[];
    /** Connection status */
    isConnected: boolean;
    /** Loading status */
    isLoading: boolean;
    /** Error state */
    error: GameError | null;
};

/**
 * Partial update type for game manager state
 */
export type GameManagerStateUpdate = Partial<GameManagerState>;

/**
 * State change subscriber type
 */
export type StateSubscriber = (state: GameManagerState) => void;

/**
 * Game join operation result
 */
export type JoinGameResult = {
    gameId: GameId;
    playerNumber: PlayerNumber;
};

/**
 * Game join operation error
 */
export type JoinGameError = GameError & {
    operation: 'join';
    gameId: GameId;
};