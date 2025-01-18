import type {
    PlayerNumber,
    GameState,
    GameMove,
    GameError,
    NetworkError,
    GameId
} from '@ctor-game/shared/types/core.js';

/**
 * Game manager state type
 * Contains all necessary information about current game state
 */
import type { GameSessionState } from '@ctor-game/shared/types/enums.js';

export type GameManagerState = {
    /** Current game state */
    gameState: GameState | null;
    /** Current player */
    currentPlayer: PlayerNumber | null;
    /** Game phase */
    phase: GameSessionState;
    /** Available replace moves for current turn */
    availableReplaces: GameMove[];
    /** Connection status */
    isConnected: boolean;
    /** Loading status */
    isLoading: boolean;
    /** Error state - can be either game or network error */
    error: GameError | NetworkError | null;
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
export type JoinGameError = (GameError | NetworkError) & {
    operation: 'join';
    gameId: GameId;
};