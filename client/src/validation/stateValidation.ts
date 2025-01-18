// Base types
import { GamePhase, Player } from '@ctor-game/shared/types/enums.js';
// Game state types
import type { IGameState } from '@ctor-game/shared/types/game.js';
import type { GameMove } from '@ctor-game/shared/types/core.js';
// Validation functions
import { isValidGamePhase } from '@ctor-game/shared/validation/primitives.js';
import { isValidGameManagerState } from '@ctor-game/shared/validation/game.js';
import { isValidScores } from '@ctor-game/shared/utils/scores.js';
import type { GameManagerState, GameManagerStateUpdate } from '../types/gameManager.js';
import { logger } from '../utils/logger.js';

/**
 * Тип ошибки валидации состояния
 */
export interface StateValidationError extends Error {
  code: 'INVALID_STATE' | 'INVALID_TRANSITION' | 'INVALID_DATA';
  field?: string;
  details?: unknown;
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
  const error = new Error(message) as StateValidationError;
  error.code = code;
  error.field = field;
  error.details = details;
  return error;
}

/**
 * Проверить корректность объекта IGameState
 */
export function validateGameState(state: unknown): state is IGameState {
  if (!state || typeof state !== 'object') {
    throw createValidationError('Invalid game state object', 'INVALID_DATA');
  }

  const gameState = state as Partial<IGameState>;

  // Проверяем обязательные поля
  if (!gameState.board || typeof gameState.board !== 'object') {
    throw createValidationError('Invalid board object', 'INVALID_DATA', 'board');
  }

  if (typeof gameState.gameOver !== 'boolean') {
    throw createValidationError('Invalid gameOver value', 'INVALID_DATA', 'gameOver');
  }

  if (
    gameState.winner !== null && 
    ![Player.First, Player.Second].includes(gameState.winner)
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
  if (extState.currentPlayer !== null && 
      ![Player.First, Player.Second].includes(extState.currentPlayer)) {
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
    const allowedTransitions: Record<GamePhase, GamePhase[]> = {
      [GamePhase.INITIAL]: [GamePhase.CONNECTING],
      [GamePhase.CONNECTING]: [GamePhase.WAITING, GamePhase.INITIAL, GamePhase.PLAYING],  // Allow direct transition to PLAYING for second player
      [GamePhase.WAITING]: [GamePhase.PLAYING, GamePhase.INITIAL, GamePhase.CONNECTING],
      [GamePhase.PLAYING]: [GamePhase.GAME_OVER, GamePhase.ERROR],
      [GamePhase.GAME_OVER]: [GamePhase.INITIAL],
      [GamePhase.ERROR]: [GamePhase.INITIAL]
    };

    if (!allowedTransitions[currentState.phase].includes(update.phase)) {
      throw createValidationError(
        `Invalid phase transition from ${currentState.phase} to ${update.phase}`,
        'INVALID_TRANSITION',
        'phase'
      );
    }
  }

  // Проверяем согласованность данных
  if (update.phase === GamePhase.PLAYING && !update.gameState) {
    throw createValidationError(
      'Game state must be provided when transitioning to PLAYING phase',
      'INVALID_TRANSITION',
      'gameState'
    );
  }

  if (update.phase === GamePhase.GAME_OVER && !update.gameState?.gameOver) {
    throw createValidationError(
      'Game must be over when transitioning to GAME_OVER phase',
      'INVALID_TRANSITION',
      'gameState'
    );
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
  if ('phase' in stateUpdate && !isValidGamePhase(stateUpdate.phase)) {
    throw createValidationError('Invalid phase in update', 'INVALID_DATA', 'phase');
  }

  if ('gameState' in stateUpdate && stateUpdate.gameState !== null) {
    validateGameState(stateUpdate.gameState);
  }

  if ('currentPlayer' in stateUpdate && 
      stateUpdate.currentPlayer !== null &&
      ![Player.First, Player.Second].includes(stateUpdate.currentPlayer)) {
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
      // Если это ошибка перехода во время подключения к игре, 
      // пробуем восстановить состояние подключения
      if (currentState.phase === GamePhase.CONNECTING && error.field === 'phase') {
        return {
          ...currentState,
          phase: GamePhase.CONNECTING,
          error: {
            code: 'STATE_VALIDATION_ERROR',
            message: 'Failed to validate state during join operation'
          }
        };
      }
      // Для других случаев возвращаемся в исходное состояние
      return {
        phase: GamePhase.INITIAL,
        gameId: null,
        playerNumber: null,
        error: {
          code: 'STATE_TRANSITION_ERROR',
          message: 'Game state was reset due to invalid transition'
        }
      };

    case 'INVALID_STATE':
    case 'INVALID_DATA':
      // При ошибке данных во время подключения сохраняем состояние подключения
      if (currentState.phase === GamePhase.CONNECTING) {
        return {
          ...currentState,
          phase: GamePhase.CONNECTING,
          error: {
            code: 'STATE_VALIDATION_ERROR',
            message: 'Maintaining connection state during data validation',
            details: error.details
          }
        };
      }
      // Для других случаев пытаемся сохранить валидное состояние
      return {
        ...currentState,
        error: {
          code: 'STATE_VALIDATION_ERROR',
          message: 'Game state was partially recovered',
          details: error.details
        }
      };

    default:
      return currentState;
  }
}