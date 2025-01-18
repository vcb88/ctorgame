import type { 
    GameState,
    GameMove,
    GameError,
    BaseError,
    ErrorCategory,
    ErrorSeverity,
    PlayerNumber,
    GameStage,
    Scores
} from '@ctor-game/shared/types/core.js';
import { GameSessionState } from '@ctor-game/shared/types/enums.js';

import type { GameManagerState, GameManagerStateUpdate } from '../types/gameManager.js';
import { logger } from '../utils/logger.js';

const PLAYER_FIRST = 1 as PlayerNumber;
const PLAYER_SECOND = 2 as PlayerNumber;

// Game phases constants
const ALLOWED_TRANSITIONS: Record<GameSessionState, GameSessionState[]> = {
    [GameSessionState.INITIAL]: [GameSessionState.PLAYING],
    [GameSessionState.PLAYING]: [GameSessionState.GAME_OVER],
    [GameSessionState.GAME_OVER]: [GameSessionState.INITIAL]
};

/**
 * Проверить корректность scores
 */
function isValidScores(scores: unknown): scores is Scores {
    if (!scores || typeof scores !== 'object') return false;
    const s = scores as Record<number, number>;
    return typeof s[PLAYER_FIRST] === 'number' && 
           typeof s[PLAYER_SECOND] === 'number';
}

/**
 * Проверить корректность фазы игры
 */
function isValidGameState(phase: unknown): phase is GameSessionState {
    return typeof phase === 'string' && 
           Object.values(GameSessionState).includes(phase as GameSessionState);
}

/**
 * Проверить базовое состояние GameManager
 */
function isValidGameManagerState(state: unknown): state is GameManagerState {
    if (!state || typeof state !== 'object') return false;
    const s = state as Partial<GameManagerState>;
    
    return typeof s.phase === 'string' &&
           (s.gameState === null || typeof s.gameState === 'object') &&
           (s.currentPlayer === null || (
               typeof s.currentPlayer === 'number' && 
               [PLAYER_FIRST, PLAYER_SECOND].includes(s.currentPlayer)
           )) &&
           typeof s.isConnected === 'boolean' &&
           typeof s.isLoading === 'boolean' &&
           Array.isArray(s.availableReplaces) &&
           (s.error === null || typeof s.error === 'object');
}

/**
 * Тип ошибки валидации состояния
 */
export interface StateValidationError extends BaseError {
  code: 'INVALID_STATE' | 'INVALID_TRANSITION' | 'INVALID_DATA';
  category: ErrorCategory;
  severity: ErrorSeverity;
  field?: string;
  details?: Record<string, unknown>;
}

/**
 * Создать ошибку валидации состояния
 */
function createValidationError(
  message: string, 
  code: StateValidationError['code'], 
  field?: string,
  details?: unknown
): StateValidationError {
  return {
    message,
    code,
    field,
    details,
    category: 'game',
    severity: 'error'
  } as StateValidationError;
}

/**
 * Проверить корректность объекта GameState
 */
export function validateGameState(state: unknown): state is GameState {
  if (!state || typeof state !== 'object') {
    throw createValidationError('Invalid game state object', 'INVALID_DATA');
  }

  const gameState = state as Partial<GameState>;

  // Проверяем обязательные поля
  if (!gameState.board || typeof gameState.board !== 'object') {
    throw createValidationError('Invalid board object', 'INVALID_DATA', 'board');
  }

  if (typeof gameState.gameOver !== 'boolean') {
    throw createValidationError('Invalid gameOver value', 'INVALID_DATA', 'gameOver');
  }

  if (
    gameState.winner !== null && 
    gameState.winner !== undefined &&
    ![PLAYER_FIRST, PLAYER_SECOND].includes(gameState.winner)
  ) {
    throw createValidationError('Invalid winner value', 'INVALID_DATA', 'winner');
  }

  if (!gameState.currentTurn || typeof gameState.currentTurn !== 'object') {
    throw createValidationError('Invalid currentTurn object', 'INVALID_DATA', 'currentTurn');
  }

  if (!isValidScores(gameState.scores)) {
    throw createValidationError('Invalid scores object', 'INVALID_DATA', 'scores');
  }

  return true;
}

/**
 * Проверить корректность ExtendedGameManagerState
 */
export function validateExtendedGameManagerState(state: unknown): state is GameManagerState {
  if (!isValidGameManagerState(state)) {
    throw createValidationError('Invalid game manager state', 'INVALID_STATE');
  }

  const extState = state as Partial<GameManagerState>;

  // Дополнительные проверки для расширенных полей
  if (extState.gameState !== null && !validateGameState(extState.gameState)) {
    throw createValidationError('Invalid game state', 'INVALID_DATA', 'gameState');
  }

  // Проверяем currentPlayer только если он определен и не null
  if (extState.currentPlayer !== null && extState.currentPlayer !== undefined &&
      ![PLAYER_FIRST, PLAYER_SECOND].includes(extState.currentPlayer)) {
    throw createValidationError('Invalid current player', 'INVALID_DATA', 'currentPlayer');
  }

  if (!Array.isArray(extState.availableReplaces)) {
    throw createValidationError('Invalid available replaces', 'INVALID_DATA', 'availableReplaces');
  }

  return true;
}

/**
 * Проверить допустимость перехода между состояниями
 */
export function validateStateTransition(
  currentState: GameManagerState,
  update: GameManagerStateUpdate
): boolean {
  // Проверяем изменение фазы
  if (update.phase) {
    if (!ALLOWED_TRANSITIONS[currentState.phase]?.includes(update.phase)) {
      throw createValidationError(
        `Invalid phase transition from ${currentState.phase} to ${update.phase}`,
        'INVALID_TRANSITION',
        'phase'
      );
    }
  }

  // Проверяем согласованность данных
  if (update.phase) {  // Проверяем только если phase определена
    if (update.phase === GameSessionState.PLAYING && !update.gameState) {
      throw createValidationError(
        'Game state must be provided when transitioning to play phase',
        'INVALID_TRANSITION',
        'gameState'
      );
    }

    if (update.phase === GameSessionState.GAME_OVER && !update.gameState?.gameOver) {
      throw createValidationError(
        'Game must be over when transitioning to end phase',
        'INVALID_TRANSITION',
        'gameState'
      );
    }
  }

  return true;
}

/**
 * Проверить корректность частичного обновления состояния
 */
export function validateStateUpdate(update: unknown): update is GameManagerStateUpdate {
  if (!update || typeof update !== 'object') {
    throw createValidationError('Invalid state update object', 'INVALID_DATA');
  }

  const stateUpdate = update as Partial<GameManagerState>;

  // Проверяем все поля, которые присутствуют в обновлении
  if ('phase' in stateUpdate && !isValidGameStage(stateUpdate.phase)) {
    throw createValidationError('Invalid phase in update', 'INVALID_DATA', 'phase');
  }

  if ('gameState' in stateUpdate && stateUpdate.gameState !== null) {
    validateGameState(stateUpdate.gameState);
  }

  if ('currentPlayer' in stateUpdate && 
      stateUpdate.currentPlayer !== null && stateUpdate.currentPlayer !== undefined &&
      ![PLAYER_FIRST, PLAYER_SECOND].includes(stateUpdate.currentPlayer)) {
    throw createValidationError('Invalid current player in update', 'INVALID_DATA', 'currentPlayer');
  }

  if ('availableReplaces' in stateUpdate && !Array.isArray(stateUpdate.availableReplaces)) {
    throw createValidationError('Invalid available replaces in update', 'INVALID_DATA', 'availableReplaces');
  }

  return true;
}

/**
 * Попытаться восстановить состояние после ошибки валидации
 */
export function recoverFromValidationError(
  currentState: GameManagerState,
  error: StateValidationError
): GameManagerStateUpdate {
  logger.error('Attempting to recover from validation error', { error });

  switch (error.code) {
    case 'INVALID_TRANSITION':
      // Если это ошибка перехода во время игры, пробуем восстановить состояние
      if (currentState.phase === ('play' as GameStage)) {
        return {
          ...currentState,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Failed to validate state during play',
            category: 'game',
            severity: 'error'
          } as GameError
        };
      }
      // Для других случаев возвращаемся в исходное состояние
      return {
        phase: 'setup' as GameStage,
        gameState: null,
        currentPlayer: null,
        availableReplaces: [],
        isConnected: false,
        isLoading: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Game state was reset due to invalid transition',
          category: 'game',
          severity: 'error'
        }
      };

    case 'INVALID_STATE':
    case 'INVALID_DATA':
      // При ошибке данных во время игры пытаемся сохранить состояние
      if (currentState.phase === ('play' as GameStage)) {
        return {
          ...currentState,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Maintaining game state during data validation',
            details: error.details,
            category: 'game',
            severity: 'error'
          } as GameError
        };
      }
      // Для других случаев пытаемся сохранить валидное состояние
      return {
        ...currentState,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Game state was partially recovered',
          details: error.details,
          category: 'game',
          severity: 'error'
        }
      };

    default:
      return currentState;
  }
}