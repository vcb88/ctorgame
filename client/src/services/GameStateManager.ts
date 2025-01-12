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
} from '../shared';
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

export class GameStateManager {
  private static instance: GameStateManager;
  private socket: Socket | null = null;
  private subscribers: Set<StateSubscriber> = new Set();
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
      
      // Reject pending join promise if exists
      if (this.joinGamePromise) {
        const { reject, timeout } = this.joinGamePromise;
        clearTimeout(timeout);
        reject({
          code: 'CONNECTION_LOST',
          message: 'Connection lost during join operation',
          operation: 'join',
          gameId: this.state.gameId || ''
        } as JoinGameError);
        this.joinGamePromise = null;
      }
    });

    this.socket.on('connect_error', (error) => {
      this.updateState({
        connectionState: 'error',
        error: { message: error.message } as GameError
      });
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
        phase: 'WAITING',
        playerNumber: payload.playerNumber
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
      const error = {
        code: payload.code,
        message: payload.message,
        details: payload.details
      };
      
      this.updateState({ error });

      // Reject joinGame promise if exists and error is related to join operation
      if (this.joinGamePromise && this.state.phase === 'CONNECTING') {
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
      this.notifySubscribers();
    } catch (error) {
      logger.error('State validation error', { error });

      if (error instanceof Error) {
        const validationError = error as StateValidationError;
        
        // Пытаемся восстановить состояние
        const recovery = recoverFromValidationError(this.state, validationError);
        
        // Применяем восстановленное состояние
        this.state = { ...this.state, ...recovery };
        this.notifySubscribers();
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
  public createGame(): void {
    if (!this.socket) return;
    this.updateState({ phase: 'CONNECTING' });
    this.socket.emit(WebSocketEvents.CreateGame);
  }

  public joinGame(gameId: string): Promise<JoinGameResult> {
    if (!this.socket) {
      return Promise.reject({
        code: 'CONNECTION_ERROR',
        message: 'Socket not initialized',
        operation: 'join',
        gameId
      } as JoinGameError);
    }

    // Clear previous join promise if exists
    if (this.joinGamePromise) {
      clearTimeout(this.joinGamePromise.timeout);
      this.joinGamePromise.reject({
        code: 'OPERATION_CANCELLED',
        message: 'Previous join operation cancelled',
        operation: 'join',
        gameId
      } as JoinGameError);
    }

    return new Promise<JoinGameResult>((resolve, reject) => {
      // Setup timeout
      const timeout = setTimeout(() => {
        if (this.joinGamePromise) {
          reject({
            code: 'TIMEOUT',
            message: 'Join game operation timed out',
            operation: 'join',
            gameId
          } as JoinGameError);
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
    this.socket.disconnect();
  }

  public makeMove(move: IGameMove): void {
    if (!this.socket || !this.state.gameId) {
      this.updateState({
        error: {
          code: WebSocketErrorCode.CONNECTION_ERROR,
          message: 'Cannot make move - not in active game',
          details: { socket: !!this.socket, gameId: this.state.gameId }
        }
      });
      return;
    }

    if (this.state.connectionState !== 'connected') {
      this.updateState({
        error: {
          code: WebSocketErrorCode.CONNECTION_ERROR,
          message: 'Cannot make move - not connected to server',
          details: { connectionState: this.state.connectionState }
        }
      });
      return;
    }

    this.socket.emit(WebSocketEvents.MakeMove, {
      gameId: this.state.gameId,
      move
    });
  }

  public endTurn(): void {
    if (!this.socket || !this.state.gameId) {
      this.updateState({
        error: {
          code: WebSocketErrorCode.CONNECTION_ERROR,
          message: 'Cannot end turn - not in active game',
          details: { socket: !!this.socket, gameId: this.state.gameId }
        }
      });
      return;
    }

    if (this.state.connectionState !== 'connected') {
      this.updateState({
        error: {
          code: WebSocketErrorCode.CONNECTION_ERROR,
          message: 'Cannot end turn - not connected to server',
          details: { connectionState: this.state.connectionState }
        }
      });
      return;
    }

    this.socket.emit(WebSocketEvents.EndTurn, {
      gameId: this.state.gameId
    });
  }
}