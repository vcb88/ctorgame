import { useCallback, useState } from 'react';
import { useGame } from './useGame';
import type { 
    OperationType,
    Player,
    GameState,
    GameActionType,
    ConnectionState,
    ErrorCode,
    ErrorSeverity,
    GameError,
    GameMove
} from '@ctor-game/shared/types/core.js';
import { GameStateManager } from '../services/GameStateManager.js';
import { validateGameMove } from '@ctor-game/shared/utils/validation.js';
import { logger } from '../utils/logger.js';
import { createGameError } from '@ctor-game/shared/utils/errors.js';

export interface UseMultiplayerGameReturn {
  // Game state
  gameId: string | null;
  playerNumber: Player | null;
  gameState: GameState | null;
  currentPlayer: Player;
  isMyTurn: boolean;
  availableReplaces: GameMove[];

  // Connection state
  connectionState: ConnectionState;
  error: GameError | null;

  // Operation state
  loading: boolean;
  operationInProgress: GameActionType | null;

  // Actions
  createGame: () => Promise<void>;
  joinGame: (gameId: string) => Promise<void>;
  makeMove: (x: number, y: number, type?: OperationType) => Promise<void>;
  endTurn: () => Promise<void>;
  
  // Computed
  isConnected: boolean;
  isConnecting: boolean;
  isError: boolean;
  canRetry: boolean;
  canRecover: boolean;
}

export const useMultiplayerGame = (): UseMultiplayerGameReturn => {
  const { state } = useGame();
  const [loading, setLoading] = useState(false);
  const [operationInProgress, setOperationInProgress] = useState<GameActionType | null>(null);

  const handleOperation = async <T>(
    operation: () => Promise<T>,
    actionType: GameActionType
  ): Promise<T> => {
    try {
      setLoading(true);
      setOperationInProgress(actionType);
      const result = await operation();
      return result;
    } finally {
      setLoading(false);
      setOperationInProgress(null);
    }
  };

  const createGame = useCallback(async () => {
    const manager = GameStateManager.getInstance();
    await handleOperation(
      () => manager.createGame(),
      GameActionType.CREATE_GAME
    );
  }, []);

  const joinGame = useCallback(async (gameId: string) => {
    const manager = GameStateManager.getInstance();
    await handleOperation(
      () => manager.joinGame(gameId),
      GameActionType.JOIN_GAME
    );
  }, []);

  const makeMove = useCallback(async (x: number, y: number, type: OperationType = OperationType.PLACE) => {
    const manager = GameStateManager.getInstance();
    const currentState = manager.getState();
    const move = { type, position: { x, y } };

    // Базовая валидация перед отправкой
    if (!currentState.gameState || !validateGameMove(move, currentState.gameState.board.size)) {
      logger.debug('Invalid move attempted', {
        component: 'useMultiplayerGame',
        data: { move, boardSize: currentState.gameState?.board.size }
      });

      throw createGameError({
        code: ErrorCode.INVALID_MOVE,
        message: 'Invalid move',
        severity: ErrorSeverity.MEDIUM,
        details: { move }
      });
    }

    await handleOperation(
      () => manager.makeMove(move),
      GameActionType.MAKE_MOVE
    );
  }, []);

  const endTurn = useCallback(async () => {
    const manager = GameStateManager.getInstance();
    await handleOperation(
      () => manager.endTurn(),
      GameActionType.END_TURN
    );
  }, []);

  // Map state
  const {
    gameId,
    playerNumber,
    connectionState,
    error,
  } = state;

  // Get extended state from GameStateManager
  const manager = GameStateManager.getInstance();
  const extendedState = manager.getState();
  const gameState = extendedState.gameState;
  const currentPlayer = extendedState.currentPlayer;
  const isMyTurn = playerNumber === currentPlayer;
  const availableReplaces = extendedState.availableReplaces || [];

  const isRetryable = error && [
    ErrorCode.CONNECTION_ERROR,
    ErrorCode.CONNECTION_TIMEOUT,
    ErrorCode.OPERATION_TIMEOUT
  ].includes(error.code);

  const isRecoverable = error && [
    ErrorCode.CONNECTION_LOST,
    ErrorCode.STATE_VALIDATION_ERROR
  ].includes(error.code);

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
    
    // Operation state
    loading,
    operationInProgress,

    // Actions
    createGame,
    joinGame,
    makeMove,
    endTurn,
    
    // Computed
    isConnected: connectionState === 'connected',
    isConnecting: connectionState === 'connecting',
    isError: connectionState === 'error',
    canRetry: isRetryable,
    canRecover: isRecoverable
  };
};