import { GameSocket, createSocket } from './socket.js';
import { StateStorageImpl as StateStorage } from './StateStorage.js';
import { ActionQueue } from './ActionQueue.js';
import { ErrorRecoveryManager } from './ErrorRecoveryManager.js';
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

import { 
    GameManagerState, 
    GameManagerStateUpdate,
    StateSubscriber,
    JoinGameResult, 
    JoinGameError 
} from '../types/gameManager.js';

import { logger } from '../utils/logger.js';

/**
 * MVP implementation of GameStateManager
 * 
 * Responsibilities:
 * - Game state management
 * - WebSocket communication
 * - Action queueing
 * - Error handling
 * - State subscriptions
 * 
 * Current limitations:
 * - Basic error handling
 * - No state persistence
 * - No reconnection handling
 * - No state synchronization
 * - No operation buffering for offline mode
 * - No cleanup for abandoned games
 * 
 * TODO:
 * - Add state cleanup on game exit
 * - Add reconnection handling with state recovery
 * - Add state synchronization mechanism
 * - Add operation buffering for offline mode
 * - Add state persistence for game recovery
 * - Add comprehensive input validation
 * - Add proper cleanup for abandoned games
 * - Add timeout handling for operations
 * - Add proper state machine for game phases
 */
export class GameStateManager {
    private static instance: GameStateManager;
    private socket: GameSocket;
    private actionQueue: ActionQueue;
    private errorManager: ErrorRecoveryManager;
    private state: GameManagerState;
    private subscribers: Set<StateSubscriber>;

    private constructor() {
        this.socket = createSocket();
        this.actionQueue = ActionQueue.getInstance();
        this.errorManager = ErrorRecoveryManager.getInstance();
        this.subscribers = new Set();
        this.state = {
            gameState: null,
            currentPlayer: null,
            phase: 'setup',
            availableReplaces: [],
            isConnected: false,
            isLoading: false,
            error: null
        };

        // Подписка на события сокета
        this.socket.on('connect', () => {
            this.updateState({ isConnected: true });
        });

        this.socket.on('disconnect', () => {
            this.updateState({ isConnected: false });
        });

        this.socket.on('error', (error: NetworkError) => {
            this.handleError(error);
        });
    }

    public static getInstance(): GameStateManager {
        if (!GameStateManager.instance) {
            GameStateManager.instance = new GameStateManager();
        }
        return GameStateManager.instance;
    }

    public getState(): GameManagerState {
        return this.state;
    }

    public subscribe(subscriber: StateSubscriber): () => void {
        this.subscribers.add(subscriber);
        return () => {
            this.subscribers.delete(subscriber);
        };
    }

    private updateState(update: GameManagerStateUpdate): void {
        logger.debug('Updating game state', {
            component: 'GameStateManager',
            currentState: this.state,
            update,
            timestamp: Date.now()
        });

        this.state = {
            ...this.state,
            ...update
        };
        this.notifySubscribers();
    }

    private notifySubscribers(): void {
        const subscriberCount = this.subscribers.size;
        logger.debug('Notifying subscribers', {
            component: 'GameStateManager',
            subscriberCount,
            timestamp: Date.now()
        });

        this.subscribers.forEach(subscriber => {
            try {
                subscriber(this.state);
            } catch (error) {
                logger.error('Error in state subscriber', {
                    component: 'GameStateManager',
                    error,
                    state: this.state,
                    timestamp: Date.now()
                });
            }
        });
    }

    private handleError(error: NetworkError): void {
        logger.error('Game state error', {
            component: 'GameStateManager',
            error,
            state: this.state,
            timestamp: Date.now()
        });

        this.updateState({ error });
        this.errorManager.handleError(error);
    }

    /**
     * Create a new game
     * 
     * MVP Implementation:
     * - Enqueues create game action
     * - Waits for server response via WebSocket
     * - Basic error handling
     */
    public async createGame(): Promise<void> {
        // Validate current state
        if (this.state.gameState) {
            this.handleError({
                code: 'OPERATION_FAILED',
                message: 'Game already in progress',
                severity: 'error',
                timestamp: Date.now()
            });
            return;
        }

        logger.debug('Creating new game', {
            component: 'GameStateManager',
            timestamp: Date.now()
        });

        try {
            this.updateState({ isLoading: true, error: null });
            await this.actionQueue.enqueue({
                type: 'CREATE_GAME',
                timestamp: Date.now()
            });
            // В MVP ждем ответа от сервера через сокет
        } catch (error) {
            this.handleError(error as NetworkError);
        } finally {
            this.updateState({ isLoading: false });
        }
    }

    /**
     * Join existing game
     * 
     * MVP Implementation:
     * - Basic input validation
     * - Enqueues join game action
     * - Waits for server response via WebSocket
     */
    public async joinGame(gameId: string): Promise<void> {
        // Validate input
        if (!gameId) {
            this.handleError({
                code: 'INVALID_GAME_ID',
                message: 'Game ID is required',
                severity: 'error',
                timestamp: Date.now()
            });
            return;
        }

        // Validate current state
        if (this.state.gameState) {
            this.handleError({
                code: 'OPERATION_FAILED',
                message: 'Already in a game',
                severity: 'error',
                timestamp: Date.now()
            });
            return;
        }

        logger.debug('Joining game', {
            component: 'GameStateManager',
            gameId,
            timestamp: Date.now()
        });

        try {
            this.updateState({ isLoading: true, error: null });
            await this.actionQueue.enqueue({
                type: 'JOIN_GAME',
                gameId,
                timestamp: Date.now()
            });
            // В MVP ждем ответа от сервера через сокет
        } catch (error) {
            this.handleError(error as NetworkError);
        } finally {
            this.updateState({ isLoading: false });
        }
    }

    /**
     * Make a game move
     * 
     * MVP Implementation:
     * - Basic move validation
     * - Enqueues move action
     * - Waits for server response via WebSocket
     */
    public async makeMove(move: GameMove): Promise<void> {
        // Validate input
        if (!move || !move.position || !move.type) {
            this.handleError({
                code: 'INVALID_MOVE',
                message: 'Invalid move format',
                severity: 'error',
                timestamp: Date.now(),
                details: { move }
            });
            return;
        }

        // Validate game state
        const gameId = this.state.gameState?.id;
        if (!gameId) {
            this.handleError({
                code: 'OPERATION_FAILED',
                message: 'No active game',
                severity: 'error',
                timestamp: Date.now()
            });
            return;
        }

        // Validate turn
        if (this.state.gameState?.currentPlayer !== this.state.currentPlayer) {
            this.handleError({
                code: 'NOT_YOUR_TURN',
                message: 'Not your turn',
                severity: 'error',
                timestamp: Date.now(),
                details: {
                    currentPlayer: this.state.gameState?.currentPlayer,
                    playerNumber: this.state.currentPlayer
                }
            });
            return;
        }

        logger.debug('Making move', {
            component: 'GameStateManager',
            gameId,
            move,
            timestamp: Date.now()
        });

        try {
            this.updateState({ isLoading: true, error: null });
            await this.actionQueue.enqueue({
                type: 'MAKE_MOVE',
                gameId,
                move,
                timestamp: Date.now()
            });
            // В MVP ждем ответа от сервера через сокет
        } catch (error) {
            this.handleError(error as NetworkError);
        } finally {
            this.updateState({ isLoading: false });
        }
    }

    /**
     * End current turn
     * 
     * MVP Implementation:
     * - Basic state validation
     * - Enqueues end turn action
     * - Waits for server response via WebSocket
     */
    public async endTurn(): Promise<void> {
        // Validate game state
        const gameId = this.state.gameState?.id;
        if (!gameId) {
            this.handleError({
                code: 'OPERATION_FAILED',
                message: 'No active game',
                severity: 'error',
                timestamp: Date.now()
            });
            return;
        }

        // Validate turn
        if (this.state.gameState?.currentPlayer !== this.state.currentPlayer) {
            this.handleError({
                code: 'NOT_YOUR_TURN',
                message: 'Not your turn',
                severity: 'error',
                timestamp: Date.now(),
                details: {
                    currentPlayer: this.state.gameState?.currentPlayer,
                    playerNumber: this.state.currentPlayer
                }
            });
            return;
        }

        logger.debug('Ending turn', {
            component: 'GameStateManager',
            gameId,
            timestamp: Date.now()
        });

        try {
            this.updateState({ isLoading: true, error: null });
            await this.actionQueue.enqueue({
                type: 'END_TURN',
                gameId,
                timestamp: Date.now()
            });
            // В MVP ждем ответа от сервера через сокет
        } catch (error) {
            this.handleError(error as NetworkError);
        } finally {
            this.updateState({ isLoading: false });
        }
    }
}