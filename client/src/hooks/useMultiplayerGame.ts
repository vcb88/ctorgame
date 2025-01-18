import { useCallback, useState } from 'react';
import { useGame } from './useGame.js';
import type { 
    Player,
    GameState,
    GameError,
    GameMove
} from '@ctor-game/shared/types/base/types.js';
import { 
    OperationType,
    ConnectionState 
} from '@ctor-game/shared/types/enums.js';

// Определяем тип для действий в игре
export type GameActionType = 
    | 'CREATE_GAME'
    | 'JOIN_GAME'
    | 'MAKE_MOVE'
    | 'END_TURN';

// Константы для действий в игре
export const GameAction = {
    CREATE_GAME: 'CREATE_GAME' as GameActionType,
    JOIN_GAME: 'JOIN_GAME' as GameActionType,
    MAKE_MOVE: 'MAKE_MOVE' as GameActionType,
    END_TURN: 'END_TURN' as GameActionType
} as const;
import { GameStateManager } from '../services/GameStateManager.js';
import { validateGameMove } from '@ctor-game/shared/utils/validation.js';
import { logger } from '../utils/logger.js';
import { createGameError } from '@ctor-game/shared/utils/errors.js';
import { BOARD_SIZE } from '@ctor-game/shared/config/constants.js';

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
      GameAction.CREATE_GAME
    );
  }, []);

  const joinGame = useCallback(async (gameId: string) => {
    const manager = GameStateManager.getInstance();
    await handleOperation(
      () => manager.joinGame(gameId),
      GameAction.JOIN_GAME
    );
  }, []);

  const makeMove = useCallback(async (x: number, y: number, type: OperationType = OperationType.PLACE) => {
    const manager = GameStateManager.getInstance();
    const currentState = manager.getState();
    const move = { type, position: { x, y } };

    // Базовая валидация перед отправкой
    if (!currentState.gameState || !validateGameMove(move)) {
      logger.debug('Invalid move attempted', {
        component: 'useMultiplayerGame',
        data: { move, boardSize: BOARD_SIZE }
      });

      throw createGameError({
        code: 'INVALID_MOVE',
        message: 'Invalid move',
        severity: 'error',
        details: { move }
      });
    }

    await handleOperation(
      () => manager.makeMove(move),
      GameAction.MAKE_MOVE
    );
  }, []);

  const endTurn = useCallback(async () => {
    const manager = GameStateManager.getInstance();
    await handleOperation(
      () => manager.endTurn(),
      GameAction.END_TURN
    );
  }, []);

  // Map state
  const {
    gameState,
    currentPlayer: playerNumber,
    isConnected,
    error,
  } = state;
  
  const gameId = gameState?.id;
  const connectionState = isConnected ? 'connected' : 'disconnected';

  // Get extended state from GameStateManager
  const manager = GameStateManager.getInstance();
  const extendedState = manager.getState();
  const gameState = extendedState.gameState;
  const currentPlayer = extendedState.currentPlayer;
  const isMyTurn = playerNumber === currentPlayer;
  const availableReplaces = extendedState.availableReplaces || [];

  const isRetryable = error && [
    'CONNECTION_ERROR',
    'CONNECTION_TIMEOUT',
    'OPERATION_TIMEOUT'
  ].includes(error.code);

  const isRecoverable = error && [
    'CONNECTION_LOST',
    'STATE_VALIDATION_ERROR'
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