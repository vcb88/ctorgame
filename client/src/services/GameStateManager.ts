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
import type { IWebSocketEvent } from '@ctor-game/shared/src/types/network/websocket.js';
import type { INetworkError, ErrorCode, ErrorSeverity } from '@ctor-game/shared/src/types/network/errors.js';
import type { IStorageConfig } from '@ctor-game/shared/src/types/storage/config.js';

// Local imports
import { createSocket, socketConfig } from './socket';
import { StateStorage } from './StateStorage';
import { ErrorRecoveryManager } from './ErrorRecoveryManager';
import { ActionQueue } from './ActionQueue';

// Types
import type { UUID } from '@ctor-game/shared/src/types/network/websocket.js';
type ConnectionState = 'connected' | 'disconnected' | 'error';
type GamePhase = 'INITIAL' | 'CONNECTING' | 'WAITING' | 'PLAYING' | 'GAME_OVER';

interface IGameManagerState {
    readonly phase: GamePhase;
    readonly gameId: UUID | null;
    readonly playerNumber: PlayerNumber | null;
    readonly error: INetworkError | null;
    readonly connectionState: ConnectionState;
    readonly gameState: IGameState | null;
    readonly currentPlayer: PlayerNumber;
    readonly availableReplaces: IGameMove[];
    readonly timestamp: number;
}

interface IGameManagerStateUpdate extends Partial<IGameManagerState> {}

type StateSubscriber = (state: IGameManagerState) => void;

interface IJoinGameResult {
    readonly gameId: UUID;
    readonly playerNumber: PlayerNumber;
    readonly eventId: UUID;
    readonly timestamp: number;
}

interface IJoinGameError extends INetworkError {
    readonly operation: 'join';
    readonly gameId: UUID;
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
        availableReplaces: [],
        timestamp: Date.now()
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
        if (state.gameId !== null && typeof state.gameId !== 'string') {
            throw new Error('Invalid state: gameId must be string or null');
        }
        if (state.playerNumber !== null && ![1, 2].includes(state.playerNumber)) {
            throw new Error('Invalid state: playerNumber must be 1, 2 or null');
        }
        if (state.gameState && typeof state.gameState !== 'object') {
            throw new Error('Invalid state: invalid game state format');
        }
        if (typeof state.timestamp !== 'number') {
            throw new Error('Invalid state: missing timestamp');
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
        this.socket.on('game_created', (event: IWebSocketEvent & { gameId: UUID }) => {
            this.updateState({
                gameId: event.gameId,
                phase: 'WAITING',
                timestamp: event.timestamp
            });
        });

        this.socket.on('game_joined', (event: IWebSocketEvent & { 
            gameId: UUID;
            status: GameStatus;
            playerNumber: PlayerNumber;
        }) => {
            this.updateState({
                gameId: event.gameId,
                phase: event.status === 'waiting' ? 'WAITING' : 'PLAYING',
                playerNumber: event.playerNumber,
                connectionState: 'connected',
                timestamp: event.timestamp
            });

            if (this.joinGamePromise) {
                const { resolve, timeout } = this.joinGamePromise;
                clearTimeout(timeout);
                resolve({
                    gameId: event.gameId,
                    playerNumber: event.playerNumber,
                    eventId: event.eventId,
                    timestamp: event.timestamp
                });
                this.joinGamePromise = null;
            }
        });

        this.socket.on('game_started', (event: IWebSocketEvent & {
            gameId: UUID;
            gameState: IGameState;
            currentPlayer: PlayerNumber;
        }) => {
            this.updateState({
                phase: 'PLAYING',
                gameState: event.gameState,
                currentPlayer: event.currentPlayer,
                timestamp: event.timestamp
            });
        });

        this.socket.on('game_state_updated', (event: IWebSocketEvent & {
            gameState: IGameState;
            currentPlayer: PlayerNumber;
            status: GameStatus;
        }) => {
            this.updateState({
                gameState: event.gameState,
                currentPlayer: event.currentPlayer,
                availableReplaces: [],
                timestamp: event.timestamp
            });
        });

        this.socket.on('available_replaces', (event: IWebSocketEvent & {
            replacements: Array<[number, number]>;
            moves: IGameMove[];
        }) => {
            this.updateState({
                availableReplaces: event.moves,
                timestamp: event.timestamp
            });
        });

        this.socket.on('game_over', (event: IWebSocketEvent & {
            gameState: IGameState;
            winner: PlayerNumber | null;
        }) => {
            this.updateState({
                phase: 'GAME_OVER',
                gameState: event.gameState,
                timestamp: event.timestamp
            });
        });

        // Handle player connection events
        this.socket.on('player_disconnected', (event: IWebSocketEvent & {
            playerNumber: PlayerNumber;
        }) => {
            if (this.state.gameState) {
                // TODO: Update player connection status in game state
                this.updateState({
                    timestamp: event.timestamp
                });
            }
        });

        this.socket.on('player_reconnected', (event: IWebSocketEvent & {
            playerNumber: PlayerNumber;
            gameState: IGameState;
            currentPlayer: PlayerNumber;
        }) => {
            this.updateState({
                gameState: event.gameState,
                currentPlayer: event.currentPlayer,
                timestamp: event.timestamp
            });
        });

        this.socket.on('game_expired', (event: IWebSocketEvent & {
            gameId: UUID;
            reason?: string;
        }) => {
            const error: INetworkError = {
                code: 'GAME_EXPIRED',
                message: event.reason || 'Game has expired',
                severity: 'MEDIUM',
                timestamp: event.timestamp
            };
            
            this.updateState({ 
                phase: 'GAME_OVER',
                error,
                timestamp: event.timestamp
            });
            this.errorManager.handleError(error);
        });

        this.socket.on('error', (payload: INetworkError) => {
            const networkError: INetworkError = {
                ...payload,
                severity: payload.severity || 'MEDIUM',
                timestamp: payload.timestamp || Date.now()
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

        const timestamp = Date.now();
        await this.actionQueue.enqueue<GameAction>({
            type: 'CREATE_GAME',
            timestamp
        });

        this.updateState({ 
            phase: 'CONNECTING',
            timestamp
        });
        this.socket.emit('create_game');
    }

    public async joinGame(gameId: UUID): Promise<IJoinGameResult> {
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

        const timestamp = Date.now();
        if (this.joinGamePromise) {
            clearTimeout(this.joinGamePromise.timeout);
            this.joinGamePromise.reject({
                code: 'OPERATION_CANCELLED',
                message: 'Previous join operation cancelled',
                severity: 'LOW',
                operation: 'join',
                gameId,
                timestamp
            });
        }

        await this.actionQueue.enqueue<GameAction>({
            type: 'JOIN_GAME',
            gameId,
            timestamp
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
            this.updateState({ 
                phase: 'CONNECTING', 
                gameId,
                timestamp: Date.now()
            });
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
            const timestamp = Date.now();
            const error: INetworkError = {
                code: 'CONNECTION_ERROR',
                message: 'Cannot make move - not in active game',
                severity: 'HIGH',
                details: { socket: !!this.socket, gameId: this.state.gameId },
                timestamp
            };
            this.errorManager.handleError(error);
            this.updateState({ error, timestamp });
            throw error;
        }

        if (this.state.connectionState !== 'connected') {
            const timestamp = Date.now();
            const error: INetworkError = {
                code: 'CONNECTION_ERROR',
                message: 'Cannot make move - not connected to server',
                severity: 'HIGH',
                details: { connectionState: this.state.connectionState },
                timestamp
            };
            this.errorManager.handleError(error);
            this.updateState({ error, timestamp });
            throw error;
        }

        const timestamp = Date.now();
        await this.actionQueue.enqueue<GameAction>({
            type: 'MAKE_MOVE',
            move,
            gameId: this.state.gameId,
            timestamp
        });

        this.updateState({ timestamp });
        this.socket.emit('make_move', {
            gameId: this.state.gameId,
            move
        });
    }

    public async endTurn(): Promise<void> {
        if (!this.socket || !this.state.gameId) {
            const timestamp = Date.now();
            const error: INetworkError = {
                code: 'CONNECTION_ERROR',
                message: 'Cannot end turn - not in active game',
                severity: 'HIGH',
                details: { socket: !!this.socket, gameId: this.state.gameId },
                timestamp
            };
            this.errorManager.handleError(error);
            this.updateState({ error, timestamp });
            throw error;
        }

        if (this.state.connectionState !== 'connected') {
            const timestamp = Date.now();
            const error: INetworkError = {
                code: 'CONNECTION_ERROR',
                message: 'Cannot end turn - not connected to server',
                severity: 'HIGH',
                details: { connectionState: this.state.connectionState },
                timestamp
            };
            this.errorManager.handleError(error);
            this.updateState({ error, timestamp });
            throw error;
        }

        const timestamp = Date.now();
        await this.actionQueue.enqueue<GameAction>({
            type: 'END_TURN',
            gameId: this.state.gameId,
            timestamp
        });

        this.updateState({ timestamp });
        this.socket.emit('end_turn', {
            gameId: this.state.gameId
        });
    }
}