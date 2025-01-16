import { GameSocket } from './socket';
import { StateStorage } from './StateStorage';
import { ActionQueue } from './ActionQueue';
import type { 
    GameState, 
    GameMove, 
    PlayerNumber, 
    GameError 
} from '@ctor-game/shared/src/types/core.js';
import type { NetworkError } from '@ctor-game/shared/src/types/network/errors.js';

/** Game manager state */
type GameManagerState = {
    gameState: GameState | null;
    currentPlayer: PlayerNumber | null;
    availableReplaces: GameMove[];
    isConnected: boolean;
    isLoading: boolean;
    error: GameError | null;
};

/** State update type */
type GameManagerStateUpdate = Partial<GameManagerState>;

/** Join game result */
type JoinGameResult = {
    gameId: string;
    playerNumber: PlayerNumber;
};

/** Join game error */
type JoinGameError = NetworkError & {
    operation: 'join';
    gameId: string;
};