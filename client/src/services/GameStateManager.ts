import { GameSocket } from './socket.js';
import { StateStorageImpl as StateStorage } from './StateStorage.js';
import { ActionQueue } from './ActionQueue.js';
import type { 
    GameState, 
    GameMove, 
    PlayerNumber, 
    GameError,
    UUID,
    Position,
    CellValue,
    NetworkError
} from '@ctor-game/shared/types/base/types.js';

/** Game manager state */
type GameManagerState = {
    gameState: GameState | null;
    currentPlayer: PlayerNumber | null;
    availableReplaces: GameMove[];  // Already using new GameMove type
    isConnected: boolean;
    isLoading: boolean;
    error: GameError | null;
    gameId: UUID | null;  // Added to track current game
    timestamp: number;      // Added for state updates tracking
};

/** State update type */
type GameManagerStateUpdate = Partial<GameManagerState>;

/** Join game result */
type JoinGameResult = {
    gameId: UUID;  // Using UUID type instead of string
    playerNumber: PlayerNumber;
};

/** Join game error */
type JoinGameError = NetworkError & {
    operation: 'join';
    gameId: UUID;  // Using UUID type instead of string
};