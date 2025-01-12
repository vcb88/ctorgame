import { Socket } from 'socket.io-client';
import {
  GamePhase,
  Player,
  ConnectionState,
  GameError,
  WebSocketEvents,
  IGameState,
  WebSocketPayloads,
  IGameMove
} from '@ctor-game/shared';
import {
  validateStateUpdate,
  validateStateTransition,
  validateExtendedGameManagerState,
  recoverFromValidationError,
  StateValidationError
} from '../validation/stateValidation';
import { createSocket, socketConfig } from './socket';
import {
  ExtendedGameManagerState,
  GameManagerStateUpdate,
  StateSubscriber
} from '../types/gameManager';
import { StateStorage } from './StateStorage';
import { StorageConfig } from '@ctor-game/shared';
import { ErrorRecoveryManager } from './ErrorRecoveryManager';
import { ErrorCode, ErrorSeverity, GameError } from '../types/errors';
import { ActionQueue } from './ActionQueue';
import { GameActionType } from '@ctor-game/shared';

const DEFAULT_STORAGE_CONFIG: StorageConfig = {
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
    resolve: (value: JoinGameResult) => void;
    reject: (error: JoinGameError) => void;
    timeout: NodeJS.Timeout;
  } | null = null;

  private state: ExtendedGameManagerState = {
    phase: 'INITIAL',
    gameId: null,
    playerNumber: null,
    error: null,
    connectionState: 'disconnected',
    gameState: null,
    currentPlayer: Player.First,
    availableReplaces: []
  };

  private constructor() {
    this.storage = new StateStorage(DEFAULT_STORAGE_CONFIG);
    this.errorManager = ErrorRecoveryManager.getInstance();
    this.actionQueue = ActionQueue.getInstance();
    
    // Try to restore state from storage
    const savedState = this.storage.loadState<ExtendedGameManagerState>('current');
    if (savedState) {
      try {
        // Validate restored state
        validateExtendedGameManagerState(savedState);
        this.state = savedState;
      } catch (error) {
        // If validation fails, remove invalid state and report error
        this.storage.removeState('current');
        this.errorManager.handleError({
          code: ErrorCode.STATE_VALIDATION_ERROR,
          message: 'Failed to restore saved state',
          severity: ErrorSeverity.MEDIUM,
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

  private setupSocket(): void {
    this.socket = createSocket(socketConfig);

    // Base connection events
    this.socket.on('connect', () => {
      this.updateState({ connectionState: 'connected' });
    });

    this.socket.on('disconnect', () => {
      this.updateState({ connectionState: 'disconnected' });
      
      // Handle disconnect error
      this.errorManager.handleError({
        code: ErrorCode.CONNECTION_LOST,
        message: 'Connection lost',
        severity: ErrorSeverity.HIGH,
        recoverable: true
      });
      
      // Reject pending join promise if exists
      if (this.joinGamePromise) {
        const { reject, timeout } = this.joinGamePromise;
        clearTimeout(timeout);
        reject({
          code: ErrorCode.CONNECTION_LOST,
          message: 'Connection lost during join operation',
          operation: 'join',
          gameId: this.state.gameId || ''
        } as JoinGameError);
        this.joinGamePromise = null;
      }
    });

    this.socket.on('connect_error', (error) => {
      const gameError: GameError = {
        code: ErrorCode.CONNECTION_ERROR,
        message: error.message,
        severity: ErrorSeverity.HIGH,
        recoverable: true,
        details: { originalError: error }
      };
      
      this.updateState({
        connectionState: 'error',
        error: gameError
      });
      
      this.errorManager.handleError(gameError);
    });

    // Clear stored state on connection error
    this.socket.on('error', () => {
      this.storage.removeState('current');
    });

    // Game events
    this.socket.on(WebSocketEvents.GameCreated, (payload: WebSocketPayloads[WebSocketEvents.GameCreated]) => {
      this.updateState({
        gameId: payload.gameId,
        phase: 'WAITING'
      });
    });

    this.socket.on(WebSocketEvents.GameJoined, (payload: WebSocketPayloads[WebSocketEvents.GameJoined]) => {
      this.updateState({
        gameId: payload.gameId,
        phase: payload.phase,
        playerNumber: payload.playerNumber,
        connectionState: 'connected'
      });

      // Resolve joinGame promise if exists
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

    this.socket.on(WebSocketEvents.GameStarted, (payload: WebSocketPayloads[WebSocketEvents.GameStarted]) => {
      this.updateState({
        phase: payload.phase,
        playerNumber: payload.currentPlayer as Player,
        gameState: payload.gameState,
        currentPlayer: payload.currentPlayer
      });
    });

    this.socket.on(WebSocketEvents.GameStateUpdated, (payload: WebSocketPayloads[WebSocketEvents.GameStateUpdated]) => {
      this.updateState({
        phase: payload.phase,
        gameState: payload.gameState,
        currentPlayer: payload.currentPlayer,
        availableReplaces: [] // Сбрасываем доступные замены при обновлении состояния
      });
    });

    this.socket.on(WebSocketEvents.AvailableReplaces, (payload: WebSocketPayloads[WebSocketEvents.AvailableReplaces]) => {
      this.updateState({
        availableReplaces: payload.moves
      });
    });

    this.socket.on(WebSocketEvents.GameOver, () => {
      this.updateState({
        phase: 'GAME_OVER'
      });
    });

    this.socket.on(WebSocketEvents.Error, (payload: WebSocketPayloads[WebSocketEvents.Error]) => {
      const gameError: GameError = {
        code: payload.code as ErrorCode,
        message: payload.message,
        severity: ErrorSeverity.MEDIUM,
        details: payload.details,
        recoverable: true,
        timestamp: Date.now()
      };
      
      this.updateState({ error: gameError });
      this.errorManager.handleError(gameError);

      // Reject joinGame promise if exists and error is related to join operation
      if (this.joinGamePromise && this.state.phase === 'CONNECTING') {
        const { reject, timeout } = this.joinGamePromise;
        clearTimeout(timeout);
        reject({
          ...gameError,
          operation: 'join',
          gameId: this.state.gameId || ''
        });
        this.joinGamePromise = null;
      }
    });
  }

  private updateState(partialState: GameManagerStateUpdate): void {
    try {
      // Валидация обновления
      validateStateUpdate(partialState);

      // Проверка перехода состояния
      validateStateTransition(this.state, partialState);

      // Применяем обновление
      const newState = { ...this.state, ...partialState };

      // Валидация результирующего состояния
      validateExtendedGameManagerState(newState);

      // Если все проверки пройдены, обновляем состояние
      this.state = newState;
      
      // Save state if we're in a meaningful phase (не сохраняем INITIAL и ошибки)
      if (newState.phase !== 'INITIAL' && !newState.error) {
        this.storage.saveState('current', newState);
      }
      
      this.notifySubscribers();
    } catch (error) {
      // Convert validation error to GameError
      const gameError: GameError = {
        code: ErrorCode.STATE_VALIDATION_ERROR,
        message: error instanceof Error ? error.message : 'State validation failed',
        severity: ErrorSeverity.HIGH,
        details: { error },
        timestamp: Date.now()
      };

      this.errorManager.handleError(gameError);

      if (error instanceof Error) {
        const validationError = error as StateValidationError;
        
        try {
          // Пытаемся восстановить состояние
          const recovery = recoverFromValidationError(this.state, validationError);
          
          // Применяем восстановленное состояние
          this.state = { ...this.state, ...recovery };
          this.notifySubscribers();
          
          // Сообщаем об успешном восстановлении
          this.errorManager.handleError({
            ...gameError,
            message: 'State recovered after validation error',
            severity: ErrorSeverity.LOW,
            recoverable: true
          });
        } catch (recoveryError) {
          // Если восстановление не удалось
          this.errorManager.handleError({
            code: ErrorCode.STATE_TRANSITION_ERROR,
            message: 'Failed to recover from invalid state',
            severity: ErrorSeverity.CRITICAL,
            details: { 
              originalError: error,
              recoveryError
            }
          });
        }
      }
    }
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(subscriber => subscriber(this.state));
  }

  public subscribe(subscriber: StateSubscriber): () => void {
    this.subscribers.add(subscriber);
    // Immediately notify with current state
    subscriber(this.state);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  public getState(): ExtendedGameManagerState {
    return this.state;
  }

  // Game actions
  public async createGame(): Promise<void> {
    if (!this.socket) {
      throw {
        code: ErrorCode.CONNECTION_ERROR,
        message: 'Socket not initialized',
        severity: ErrorSeverity.HIGH
      } as GameError;
    }

    await this.actionQueue.enqueue({
      type: GameActionType.CREATE_GAME,
      timestamp: Date.now()
    });

    this.updateState({ phase: 'CONNECTING' });
    this.socket.emit(WebSocketEvents.CreateGame);
  }

  public async joinGame(gameId: string): Promise<JoinGameResult> {
    if (!this.socket) {
      throw {
        code: ErrorCode.CONNECTION_ERROR,
        message: 'Socket not initialized',
        severity: ErrorSeverity.HIGH,
        details: { operation: 'join', gameId }
      } as GameError;
    }

    // Clear previous join promise if exists
    if (this.joinGamePromise) {
      clearTimeout(this.joinGamePromise.timeout);
      this.joinGamePromise.reject({
        code: ErrorCode.OPERATION_CANCELLED,
        message: 'Previous join operation cancelled',
        severity: ErrorSeverity.LOW,
        details: { operation: 'join', gameId }
      } as GameError);
    }

    // Add join action to queue
    await this.actionQueue.enqueue({
      type: GameActionType.JOIN_GAME,
      gameId,
      timestamp: Date.now()
    });

    return new Promise<JoinGameResult>((resolve, reject) => {
      // Setup timeout
      const timeout = setTimeout(() => {
        if (this.joinGamePromise) {
          const error = {
            code: ErrorCode.OPERATION_TIMEOUT,
            message: 'Join game operation timed out',
            severity: ErrorSeverity.MEDIUM,
            details: { operation: 'join', gameId }
          } as GameError;
          
          this.errorManager.handleError(error);
          reject(error);
          this.joinGamePromise = null;
        }
      }, 10000); // 10 second timeout

      // Store promise handlers
      this.joinGamePromise = { resolve, reject, timeout };

      // Update state and emit join event
      this.updateState({ phase: 'CONNECTING', gameId });
      this.socket.emit(WebSocketEvents.JoinGame, { gameId });
    });
  }

  public disconnect(): void {
    if (!this.socket) return;
    
    // Clear stored state and action queue when disconnecting
    this.storage.removeState('current');
    this.actionQueue.clear();
    this.socket.disconnect();
  }

  public async makeMove(move: IGameMove): Promise<void> {
    if (!this.socket || !this.state.gameId) {
      const error = {
        code: ErrorCode.CONNECTION_ERROR,
        message: 'Cannot make move - not in active game',
        severity: ErrorSeverity.HIGH,
        details: { socket: !!this.socket, gameId: this.state.gameId }
      } as GameError;
      this.errorManager.handleError(error);
      throw error;
    }

    if (this.state.connectionState !== 'connected') {
      const error = {
        code: ErrorCode.CONNECTION_ERROR,
        message: 'Cannot make move - not connected to server',
        severity: ErrorSeverity.HIGH,
        details: { connectionState: this.state.connectionState }
      } as GameError;
      this.errorManager.handleError(error);
      throw error;
    }

    // Add move action to queue
    await this.actionQueue.enqueue({
      type: GameActionType.MAKE_MOVE,
      move,
      gameId: this.state.gameId,
      timestamp: Date.now()
    });

    this.socket.emit(WebSocketEvents.MakeMove, {
      gameId: this.state.gameId,
      move
    });
  }

  public async endTurn(): Promise<void> {
    if (!this.socket || !this.state.gameId) {
      const error = {
        code: ErrorCode.CONNECTION_ERROR,
        message: 'Cannot end turn - not in active game',
        severity: ErrorSeverity.HIGH,
        details: { socket: !!this.socket, gameId: this.state.gameId }
      } as GameError;
      this.errorManager.handleError(error);
      throw error;
    }

    if (this.state.connectionState !== 'connected') {
      const error = {
        code: ErrorCode.CONNECTION_ERROR,
        message: 'Cannot end turn - not connected to server',
        severity: ErrorSeverity.HIGH,
        details: { connectionState: this.state.connectionState }
      } as GameError;
      this.errorManager.handleError(error);
      throw error;
    }

    // Add end turn action to queue
    await this.actionQueue.enqueue({
      type: GameActionType.END_TURN,
      gameId: this.state.gameId,
      timestamp: Date.now()
    });

    this.socket.emit(WebSocketEvents.EndTurn, {
      gameId: this.state.gameId
    });
  }
}