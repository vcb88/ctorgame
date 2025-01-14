import { ErrorRecoveryManager } from './ErrorRecoveryManager';
import type { GameAction, ICreateGameAction, IJoinGameAction, IMakeMoveAction, IEndTurnAction } from '@ctor-game/shared/src/types/game/actions.js';
import type { ErrorCode, ErrorSeverity, INetworkError } from '@ctor-game/shared/src/types/network/errors.js';

interface QueuedAction {
  action: GameAction;
  resolve: (value: any) => void;
  reject: (error: INetworkError) => void;
}

/**
 * Manages game actions queue to prevent race conditions
 * For MVP, we implement a simple sequential queue
 */
export class ActionQueue {
  private static instance: ActionQueue;
  private queue: QueuedAction[] = [];
  private processing: boolean = false;
  private errorManager: ErrorRecoveryManager;

  private constructor() {
    this.errorManager = ErrorRecoveryManager.getInstance();
  }

  public static getInstance(): ActionQueue {
    if (!ActionQueue.instance) {
      ActionQueue.instance = new ActionQueue();
    }
    return ActionQueue.instance;
  }

  /**
   * Add action to queue
   */
  public enqueue<T>(action: GameAction): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      // Add action to queue
      this.queue.push({
        action,
        resolve,
        reject
      });

      // Try to process queue
      this.processQueue();
    });
  }

  /**
   * Check if action can be processed
   * In MVP we only check for duplicates and basic conflicts
   */
  private canProcessAction(action: GameAction): boolean {
    // Check for duplicate actions in queue
    const duplicates = this.queue.filter(qa => 
      qa.action.type === action.type &&
      'gameId' in qa.action && 'gameId' in action &&
      qa.action.gameId === action.gameId
    );

    if (duplicates.length > 1) {
      return false;
    }

    // Check for conflicting actions
    const conflicts = this.queue.some(qa => {
      // Can't have multiple moves in queue
      if (qa.action.type === 'MAKE_MOVE' && 
          action.type === 'MAKE_MOVE') {
        return true;
      }

      // Can't end turn while move is pending
      if (qa.action.type === 'MAKE_MOVE' && 
          action.type === 'END_TURN') {
        return true;
      }

      return false;
    });

    return !conflicts;
  }

  /**
   * Process next action in queue
   */
  private async processQueue(): Promise<void> {
    // Check if already processing
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    const { action, resolve, reject } = this.queue[0];

    try {
      // Check if action can be processed
      if (!this.canProcessAction(action)) {
        throw {
          code: 'OPERATION_FAILED' as ErrorCode,
          message: 'Conflicting operation in progress',
          severity: 'MEDIUM' as ErrorSeverity,
          details: { action }
        } as INetworkError;
      }

      // Process action (in MVP we just resolve immediately)
      resolve(action);

      // Remove processed action
      this.queue.shift();
    } catch (error) {
      // Handle error
      const networkError = error as INetworkError;
      this.errorManager.handleError(networkError);
      reject(networkError);
      
      // Remove failed action
      this.queue.shift();
    } finally {
      this.processing = false;

      // Process next action if queue not empty
      if (this.queue.length > 0) {
        this.processQueue();
      }
    }
  }

  /**
   * Clear all pending actions
   */
  public clear(): void {
    this.queue.forEach(({ reject }) => {
      reject({
        code: 'OPERATION_CANCELLED',
        message: 'Operation cancelled - queue cleared',
        severity: 'LOW',
        timestamp: Date.now()
      });
    });
    this.queue = [];
    this.processing = false;
  }

  /**
   * Get number of pending actions
   */
  public get pendingCount(): number {
    return this.queue.length;
  }

  /**
   * Check if specific action type is pending
   */
  public isActionPending(type: GameAction['type']): boolean {
    return this.queue.some(qa => qa.action.type === type);
  }
}