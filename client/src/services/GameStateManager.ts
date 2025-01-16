import { GameSocket } from './socket';
import { StateStorage } from './StateStorage';
import { ActionQueue } from './ActionQueue';
import type { 
    GameState, 
    GameMove, 
    PlayerNumber, 
    GameError,
    GameId,
    Position,
    CellValue
} from '@ctor-game/shared/src/types/core.js';
import type { NetworkError } from '@ctor-game/shared/src/types/network/errors.js';

/** Game manager state */
type GameManagerState = {
    gameState: GameState | null;
    currentPlayer: PlayerNumber | null;
    availableReplaces: GameMove[];  // Already using new GameMove type
    isConnected: boolean;
    isLoading: boolean;
    error: GameError | null;
    gameId: GameId | null;  // Added to track current game
    timestamp: number;      // Added for state updates tracking
};

/** State update type */
type GameManagerStateUpdate = Partial<GameManagerState>;

/** Join game result */
type JoinGameResult = {
    gameId: GameId;  // Using GameId type instead of string
    playerNumber: PlayerNumber;
};

/** Join game error */
type JoinGameError = NetworkError & {
    operation: 'join';
    gameId: GameId;  // Using GameId type instead of string
};