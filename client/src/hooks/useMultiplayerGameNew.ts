import { useCallback } from 'react';
import { useGame } from './useGame';
import { OperationType, Player, IGameState, ConnectionState } from '../shared';
import { GameStateManager } from '../services/GameStateManager';
import { GameError } from '../types/connection';
import { validateGameMove } from '../validation/game';
import { logger } from '../utils/logger';

export interface UseMultiplayerGameReturn {
  // Game state
  gameId: string | null;
  playerNumber: Player | null;
  gameState: IGameState | null;
  currentPlayer: Player;
  isMyTurn: boolean;
  availableReplaces: [];  // TODO: implement in next iteration
  
  // Connection state
  connectionState: ConnectionState;
  error: GameError | null;
  
  // Actions
  createGame: () => void;
  joinGame: (gameId: string) => Promise<boolean>;
  makeMove: (x: number, y: number, type?: OperationType) => void;
  endTurn: () => void;
  
  // Computed
  isConnected: boolean;
  isConnecting: boolean;
  isError: boolean;
  canRetry: boolean;
  canRecover: boolean;
}

export const useMultiplayerGameNew = (): UseMultiplayerGameReturn => {
  const { state, createGame: createGameBase, joinGame: joinGameBase } = useGame();

  const makeMove = useCallback((x: number, y: number, type: OperationType = OperationType.PLACE) => {
    const manager = GameStateManager.getInstance();
    const move = { type, position: { x, y } };

    // Базовая валидация перед отправкой
    if (gameState && !validateGameMove(move, gameState.board.size)) {
      logger.debug('Invalid move attempted', {
        component: 'useMultiplayerGameNew',
        data: { move, boardSize: gameState.board.size }
      });
      return;
    }

    manager.makeMove(move);
  }, [gameState]);

  const endTurn = useCallback(() => {
    const manager = GameStateManager.getInstance();
    manager.endTurn();
  }, []);

  // Map new state to old interface
  const {
    gameId,
    playerNumber,
    connectionState,
    error,
    phase
  } = state;

  // Get extended state from GameStateManager
  const manager = GameStateManager.getInstance();
  const managerState = manager.getState() as any; // TODO: update types in next iteration
  const gameState = managerState.gameState;
  const currentPlayer = managerState.currentPlayer;
  const isMyTurn = playerNumber === currentPlayer;
  const availableReplaces = managerState.availableReplaces;

  return {
    // Game state
    gameId,
    playerNumber,
    gameState,
    currentPlayer,
    isMyTurn,
    availableReplaces,
    
    // Connection state
    connectionState,
    error,
    
    // Actions
    createGame: createGameBase,
    joinGame: (id: string) => {
      joinGameBase(id);
      return Promise.resolve(true); // TODO: implement proper promise in next iteration
    },
    makeMove,
    endTurn,
    
    // Computed
    isConnected: connectionState === 'connected',
    isConnecting: connectionState === 'connecting',
    isError: connectionState === 'error',
    canRetry: error?.retryable || false,
    canRecover: error?.recoverable || false
  };
};