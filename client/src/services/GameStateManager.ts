import { Socket } from 'socket.io-client';
import type { 
    IGameState,
    IGameMove,
    PlayerNumber,
    GameStatus
} from '@ctor-game/shared/src/types/game/types.js';
import type {
    GameAction,
    ICreateGameAction,
    IJoinGameAction,
    IMakeMoveAction,
    IEndTurnAction
} from '@ctor-game/shared/src/types/game/actions.js';
import type {
    IWebSocketEvent,
    WebSocketErrorCode,
    ErrorSeverity,
    INetworkError
} from '@ctor-game/shared/src/types/network/websocket.js';
import type { IStorageConfig } from '@ctor-game/shared/src/types/storage/config.js';

// Local imports
import { createSocket, socketConfig } from './socket';
import { StateStorage } from './StateStorage';
import { ErrorRecoveryManager } from './ErrorRecoveryManager';
import { ActionQueue } from './ActionQueue';

// Types
type ConnectionState = 'connected' | 'disconnected' | 'error';
type GamePhase = 'INITIAL' | 'CONNECTING' | 'WAITING' | 'PLAYING' | 'GAME_OVER';

interface IGameManagerState {
    readonly phase: GamePhase;
    readonly gameId: string | null;
    readonly playerNumber: PlayerNumber | null;
    readonly error: INetworkError | null;
    readonly connectionState: ConnectionState;
    readonly gameState: IGameState | null;
    readonly currentPlayer: PlayerNumber;
    readonly availableReplaces: IGameMove[];
}

interface IGameManagerStateUpdate extends Partial<IGameManagerState> {}

type StateSubscriber = (state: IGameManagerState) => void;

interface IJoinGameResult {
    readonly gameId: string;
    readonly playerNumber: PlayerNumber;
}

interface IJoinGameError extends INetworkError {
    readonly operation: 'join';
    readonly gameId: string;
}

const DEFAULT_STORAGE_CONFIG: IStorageConfig = {
    prefix: 'game_state',
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    version: '0.1.0'
};

export class GameStateManager {
    private static instance: GameStateManager;
    private socket: Socket | null = null;
    private subscribers: Set<StateSubscriber> = new Set();
    private storage: StateStorage;
    private errorManager: ErrorRecoveryManager;
    private actionQueue: ActionQueue;
    private joinGamePromise: { 
        resolve: (value: IJoinGameResult) => void;
        reject: (error: IJoinGameError) => void;
        timeout: NodeJS.Timeout;
    } | null = null;

    private state: IGameManagerState = {
        phase: 'INITIAL',
        gameId: null,
        playerNumber: null,
        error: null,
        connectionState: 'disconnected',
        gameState: null,
        currentPlayer: 1,
        availableReplaces: []
    };

    private constructor() {
        this.storage = new StateStorage(DEFAULT_STORAGE_CONFIG);
        this.errorManager = ErrorRecoveryManager.getInstance();
        this.actionQueue = ActionQueue.getInstance();
        
        // Try to restore state from storage
        const savedState = this.storage.loadState<IGameManagerState>('current');
        if (savedState) {
            try {
                this.validateState(savedState);
                this.state = savedState;
            } catch (error) {
                this.storage.removeState('current');
                this.errorManager.handleError({
                    code: 'STATE_VALIDATION_ERROR',
                    message: 'Failed to restore saved state',
                    severity: 'MEDIUM',
                    details: { error }
                });
            }
        }

        this.setupSocket();
    }

    public static getInstance(): GameStateManager {
        if (!GameStateManager.instance) {
            GameStateManager.instance = new GameStateManager();
        }
        return GameStateManager.instance;
    }

    private validateState(state: IGameManagerState): void {
        if (!state || typeof state.phase !== 'string') {
            throw new Error('Invalid state: missing or invalid phase');
        }
        // Add more validation as needed for MVP
    }

    private setupSocket(): void {
        this.socket = createSocket(socketConfig);

        // Base connection events
        this.socket.on('connect', () => {
            this.updateState({ connectionState: 'connected' });
        });

        this.socket.on('disconnect', () => {
            this.updateState({ connectionState: 'disconnected' });
            
            const error: INetworkError = {
                code: 'CONNECTION_LOST',
                message: 'Connection lost',
                severity: 'HIGH',
                recoverable: true,
                timestamp: Date.now()
            };
            this.errorManager.handleError(error);
            
            if (this.joinGamePromise) {
                const { reject, timeout } = this.joinGamePromise;
                clearTimeout(timeout);
                reject({
                    ...error,
                    operation: 'join',
                    gameId: this.state.gameId || ''
                });
                this.joinGamePromise = null;
            }
        });

        this.socket.on('connect_error', (error) => {
            const networkError: INetworkError = {
                code: 'CONNECTION_ERROR',
                message: error.message,
                severity: 'HIGH',
                recoverable: true,
                details: { originalError: error },
                timestamp: Date.now()
            };
            
            this.updateState({
                connectionState: 'error',
                error: networkError
            });
            
            this.errorManager.handleError(networkError);
        });

        // Clear stored state on connection error
        this.socket.on('error', () => {
            this.storage.removeState('current');
        });

        // Game events
        this.socket.on('game_created', (payload: { gameId: string }) => {
            this.updateState({
                gameId: payload.gameId,
                phase: 'WAITING'
            });
        });

        this.socket.on('game_joined', (payload: { 
            gameId: string;
            status: GameStatus;
            playerNumber: PlayerNumber;
        }) => {
            this.updateState({
                gameId: payload.gameId,
                phase: payload.status === 'waiting' ? 'WAITING' : 'PLAYING',
                playerNumber: payload.playerNumber,
                connectionState: 'connected'
            });

            if (this.joinGamePromise) {
                const { resolve, timeout } = this.joinGamePromise;
                clearTimeout(timeout);
                resolve({
                    gameId: payload.gameId,
                    playerNumber: payload.playerNumber
                });
                this.joinGamePromise = null;
            }
        });

        this.socket.on('game_started', (payload: {
            gameState: IGameState;
            currentPlayer: PlayerNumber;
        }) => {
            this.updateState({
                phase: 'PLAYING',
                gameState: payload.gameState,
                currentPlayer: payload.currentPlayer
            });
        });

        this.socket.on('game_state_updated', (payload: {
            gameState: IGameState;
            currentPlayer: PlayerNumber;
        }) => {
            this.updateState({
                gameState: payload.gameState,
                currentPlayer: payload.currentPlayer,
                availableReplaces: []
            });
        });

        this.socket.on('available_replaces', (payload: {
            moves: IGameMove[];
        }) => {
            this.updateState({
                availableReplaces: payload.moves
            });
        });

        this.socket.on('game_over', () => {
            this.updateState({
                phase: 'GAME_OVER'
            });
        });

        this.socket.on('error', (payload: {
            code: WebSocketErrorCode;
            message: string;
            details?: unknown;
        }) => {
            const networkError: INetworkError = {
                code: payload.code,
                message: payload.message,
                severity: 'MEDIUM',
                details: payload.details,
                recoverable: true,
                timestamp: Date.now()
            };
            
            this.updateState({ error: networkError });
            this.errorManager.handleError(networkError);

            if (this.joinGamePromise && this.state.phase === 'CONNECTING') {
                const { reject, timeout } = this.joinGamePromise;
                clearTimeout(timeout);
                reject({
                    ...networkError,
                    operation: 'join',
                    gameId: this.state.gameId || ''
                });
                this.joinGamePromise = null;
            }
        });
    }

    private updateState(partialState: IGameManagerStateUpdate): void {
        try {
            const newState = { ...this.state, ...partialState };
            this.validateState(newState);
            this.state = newState;
            
            if (newState.phase !== 'INITIAL' && !newState.error) {
                this.storage.saveState('current', newState);
            }
            
            this.notifySubscribers();
        } catch (error) {
            const networkError: INetworkError = {
                code: 'STATE_VALIDATION_ERROR',
                message: error instanceof Error ? error.message : 'State validation failed',
                severity: 'HIGH',
                details: { error },
                timestamp: Date.now()
            };

            this.errorManager.handleError(networkError);
        }
    }

    private notifySubscribers(): void {
        this.subscribers.forEach(subscriber => subscriber(this.state));
    }

    public subscribe(subscriber: StateSubscriber): () => void {
        this.subscribers.add(subscriber);
        subscriber(this.state);
        return () => {
            this.subscribers.delete(subscriber);
        };
    }

    public getState(): IGameManagerState {
        return this.state;
    }

    public async createGame(): Promise<void> {
        if (!this.socket) {
            const error: INetworkError = {
                code: 'CONNECTION_ERROR',
                message: 'Socket not initialized',
                severity: 'HIGH',
                timestamp: Date.now()
            };
            throw error;
        }

        await this.actionQueue.enqueue<GameAction>({
            type: 'CREATE_GAME',
            timestamp: Date.now()
        });

        this.updateState({ phase: 'CONNECTING' });
        this.socket.emit('create_game');
    }

    public async joinGame(gameId: string): Promise<IJoinGameResult> {
        if (!this.socket) {
            const error: INetworkError = {
                code: 'CONNECTION_ERROR',
                message: 'Socket not initialized',
                severity: 'HIGH',
                details: { operation: 'join', gameId },
                timestamp: Date.now()
            };
            throw error;
        }

        if (this.joinGamePromise) {
            clearTimeout(this.joinGamePromise.timeout);
            this.joinGamePromise.reject({
                code: 'OPERATION_CANCELLED',
                message: 'Previous join operation cancelled',
                severity: 'LOW',
                operation: 'join',
                gameId,
                timestamp: Date.now()
            });
        }

        await this.actionQueue.enqueue<GameAction>({
            type: 'JOIN_GAME',
            gameId,
            timestamp: Date.now()
        });

        return new Promise<IJoinGameResult>((resolve, reject) => {
            const timeout = setTimeout(() => {
                if (this.joinGamePromise) {
                    const error: IJoinGameError = {
                        code: 'OPERATION_TIMEOUT',
                        message: 'Join game operation timed out',
                        severity: 'MEDIUM',
                        operation: 'join',
                        gameId,
                        timestamp: Date.now()
                    };
                    
                    this.errorManager.handleError(error);
                    reject(error);
                    this.joinGamePromise = null;
                }
            }, 10000);

            this.joinGamePromise = { resolve, reject, timeout };
            this.updateState({ phase: 'CONNECTING', gameId });
            this.socket.emit('join_game', { gameId });
        });
    }

    public disconnect(): void {
        if (!this.socket) return;
        
        this.storage.removeState('current');
        this.actionQueue.clear();
        this.socket.disconnect();
    }

    public async makeMove(move: IGameMove): Promise<void> {
        if (!this.socket || !this.state.gameId) {
            const error: INetworkError = {
                code: 'CONNECTION_ERROR',
                message: 'Cannot make move - not in active game',
                severity: 'HIGH',
                details: { socket: !!this.socket, gameId: this.state.gameId },
                timestamp: Date.now()
            };
            this.errorManager.handleError(error);
            throw error;
        }

        if (this.state.connectionState !== 'connected') {
            const error: INetworkError = {
                code: 'CONNECTION_ERROR',
                message: 'Cannot make move - not connected to server',
                severity: 'HIGH',
                details: { connectionState: this.state.connectionState },
                timestamp: Date.now()
            };
            this.errorManager.handleError(error);
            throw error;
        }

        await this.actionQueue.enqueue<GameAction>({
            type: 'MAKE_MOVE',
            move,
            gameId: this.state.gameId,
            timestamp: Date.now()
        });

        this.socket.emit('make_move', {
            gameId: this.state.gameId,
            move
        });
    }

    public async endTurn(): Promise<void> {
        if (!this.socket || !this.state.gameId) {
            const error: INetworkError = {
                code: 'CONNECTION_ERROR',
                message: 'Cannot end turn - not in active game',
                severity: 'HIGH',
                details: { socket: !!this.socket, gameId: this.state.gameId },
                timestamp: Date.now()
            };
            this.errorManager.handleError(error);
            throw error;
        }

        if (this.state.connectionState !== 'connected') {
            const error: INetworkError = {
                code: 'CONNECTION_ERROR',
                message: 'Cannot end turn - not connected to server',
                severity: 'HIGH',
                details: { connectionState: this.state.connectionState },
                timestamp: Date.now()
            };
            this.errorManager.handleError(error);
            throw error;
        }

        await this.actionQueue.enqueue<GameAction>({
            type: 'END_TURN',
            gameId: this.state.gameId,
            timestamp: Date.now()
        });

        this.socket.emit('end_turn', {
            gameId: this.state.gameId
        });
    }
}