import { 
  GameManagerState,
  IGameState,
  Player,
  IGameMove
} from '../shared';

/**
 * Расширенное состояние GameStateManager, включающее игровые данные
 */
export interface ExtendedGameManagerState extends GameManagerState {
  /** Текущее состояние игры */
  gameState: IGameState | null;
  /** Текущий игрок */
  currentPlayer: Player;
  /** Доступные замены для текущего хода */
  availableReplaces: IGameMove[];
}

/**
 * Тип для частичного обновления состояния
 */
export type GameManagerStateUpdate = Partial<ExtendedGameManagerState>;

/**
 * Тип для подписчика на изменения состояния
 */
export type StateSubscriber = (state: ExtendedGameManagerState) => void;