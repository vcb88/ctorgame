// Base types
import type { Player } from '@ctor-game/shared/types/enums';
// Game state types
import type { GameManagerState } from '@ctor-game/shared/types/state';
import type { IGameState } from '@ctor-game/shared/types/game/state';
import type { GameMove } from '@ctor-game/shared/types/game/moves';
// Error types
import type { GameError } from '@ctor-game/shared/types/base';

/**
 * Расширенное состояние GameStateManager, включающее игровые данные
 */
export interface ExtendedGameManagerState extends GameManagerState {
  /** Текущее состояние игры */
  gameState: IGameState | null;
  /** Текущий игрок */
  currentPlayer: Player | null;
  /** Доступные замены для текущего хода */
  availableReplaces: GameMove[];
}

/**
 * Тип для частичного обновления состояния
 */
export type GameManagerStateUpdate = Partial<ExtendedGameManagerState>;

/**
 * Тип для подписчика на изменения состояния
 */
export type StateSubscriber = (state: ExtendedGameManagerState) => void;

/**
 * Результат операции присоединения к игре
 */
export interface JoinGameResult {
  /** ID игры */
  gameId: string;
  /** Номер игрока */
  playerNumber: Player;
}

/**
 * Ошибка операции присоединения к игре
 */
export interface JoinGameError extends GameError {
  /** Тип операции */
  operation: 'join';
  /** ID игры */
  gameId: string;
}