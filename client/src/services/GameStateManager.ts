import { Socket } from 'socket.io-client';
import {
  GameManagerState,
  GamePhase,
  Player,
  ConnectionState,
  GameError,
  WebSocketEvents,
  IGameState,
  WebSocketPayloads
} from '../shared';
import { createSocket, socketConfig } from './socket';

type StateSubscriber = (state: GameManagerState) => void;

export class GameStateManager {
  private static instance: GameStateManager;
  private socket: Socket | null = null;
  private subscribers: Set<StateSubscriber> = new Set();

  private state: GameManagerState = {
    phase: 'INITIAL',
    gameId: null,
    playerNumber: null,
    error: null,
    connectionState: 'disconnected'
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
        phase: 'WAITING'
      });
    });

    this.socket.on(WebSocketEvents.GameStarted, (payload: WebSocketPayloads[WebSocketEvents.GameStarted]) => {
      this.updateState({
        phase: payload.phase,
        playerNumber: payload.currentPlayer as Player
      });
    });

    this.socket.on(WebSocketEvents.GameStateUpdated, (payload: WebSocketPayloads[WebSocketEvents.GameStateUpdated]) => {
      this.updateState({
        phase: payload.phase
      });
    });

    this.socket.on(WebSocketEvents.GameOver, () => {
      this.updateState({
        phase: 'GAME_OVER'
      });
    });

    this.socket.on(WebSocketEvents.Error, (payload: WebSocketPayloads[WebSocketEvents.Error]) => {
      this.updateState({
        error: {
          code: payload.code,
          message: payload.message,
          details: payload.details
        }
      });
    });
  }

  private updateState(partialState: Partial<GameManagerState>): void {
    this.state = { ...this.state, ...partialState };
    this.notifySubscribers();
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

  public getState(): GameManagerState {
    return this.state;
  }

  // Game actions
  public createGame(): void {
    if (!this.socket) return;
    this.updateState({ phase: 'CONNECTING' });
    this.socket.emit(WebSocketEvents.CreateGame);
  }

  public joinGame(gameId: string): void {
    if (!this.socket) return;
    this.updateState({ phase: 'CONNECTING' });
    this.socket.emit(WebSocketEvents.JoinGame, { gameId });
  }

  public disconnect(): void {
    if (!this.socket) return;
    this.socket.disconnect();
  }
}