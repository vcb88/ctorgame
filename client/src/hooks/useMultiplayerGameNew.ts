import { useCallback, useState } from 'react';
import { useGame } from './useGame';
import { 
  OperationType, 
  Player, 
  IGameState, 
  ConnectionState,
  GameActionType,
  ErrorCode,
  ErrorSeverity,
  GameError
} from '@ctor-game/shared';
import { GameStateManager } from '../services/GameStateManager';
import { validateGameMove } from '../validation/game';
import { logger } from '../utils/logger';

export interface UseMultiplayerGameReturn {
  // Game state
  gameId: string | null;
  playerNumber: Player | null;
  gameState: IGameState | null;
  currentPlayer: Player;
  isMyTurn: boolean;
  availableReplaces: [];

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

export const useMultiplayerGameNew = (): UseMultiplayerGameReturn => {
  const { state } = useGame();
  const [loading, setLoading] = useState(false);
  const [operationInProgress, setOperationInProgress] = useState<GameActionType | null>(null);

  const handleOperation = async <T extends any>(
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
    const move = { type, position: { x, y } };

    // Базовая валидация перед отправкой
    if (!managerState.gameState || !validateGameMove(move, managerState.gameState.board.size)) {
      logger.debug('Invalid move attempted', {
        component: 'useMultiplayerGameNew',
        data: { move, boardSize: managerState.gameState?.board.size }
      });

      throw {
        code: ErrorCode.INVALID_MOVE,
        message: 'Invalid move',
        severity: ErrorSeverity.MEDIUM,
        details: { move }
      } as GameError;
    }

    await handleOperation(
      () => manager.makeMove(move),
      GameActionType.MAKE_MOVE
    );
  }, [managerState.gameState]);

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
  const managerState = manager.getState();
  const gameState = managerState.gameState;
  const currentPlayer = managerState.currentPlayer;
  const isMyTurn = playerNumber === currentPlayer;
  const availableReplaces = managerState.availableReplaces;

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