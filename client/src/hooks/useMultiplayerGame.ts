import { useCallback, useState } from 'react';
import { useGame } from './useGame.js';
import type { 
    GameState,
    GameError,
    GameMove,
    PlayerNumber
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
  playerNumber: PlayerNumber | null;
  gameState: GameState | null;
  currentPlayer: PlayerNumber | null;
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
    const managerState = manager.getState();
    const move = { type, position: { x, y } };

    // Базовая валидация перед отправкой
    if (!managerState.gameState || !validateGameMove(move)) {
      logger.debug('Invalid move attempted', {
        component: 'useMultiplayerGame',
        data: { move, boardSize: BOARD_SIZE }
      });

      throw createGameError(
        'INVALID_MOVE',
        'Invalid move',
        { move }
      );
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

  // Map state from base hook
  const {
    gameState: baseGameState,
    currentPlayer: playerNumber,
    isConnected,
    error,
  } = state;
  
  const gameId = baseGameState?.id;
  let connectionState = ConnectionState.DISCONNECTED;
  if (isConnected) {
    connectionState = ConnectionState.CONNECTED;
  } else if (loading) {
    connectionState = ConnectionState.CONNECTING;
  } else if (error) {
    connectionState = ConnectionState.ERROR;
  }

  // Get current game state from manager
  const gameStateManager = GameStateManager.getInstance();
  const managerFullState = gameStateManager.getState();
  const currentGameState = managerFullState.gameState;
  const currentPlayer = managerFullState.currentPlayer;
  const isMyTurn = playerNumber === currentPlayer;
  const availableReplaces = managerFullState.availableReplaces || [];

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
    gameId: gameId ?? null,
    playerNumber,
    gameState: currentGameState,
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
    isConnected: connectionState === ConnectionState.CONNECTED,
    isConnecting: connectionState === ConnectionState.CONNECTING,
    isError: connectionState === ConnectionState.ERROR,
    canRetry: isRetryable || false,
    canRecover: isRecoverable || false
  };
};