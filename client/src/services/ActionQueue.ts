import { ErrorRecoveryManager } from './ErrorRecoveryManager';
import { GameActionType } from '@ctor-game/shared';
import { ErrorCode, ErrorSeverity, GameError, GameActionUnion } from '../types/errors';

interface QueuedAction {
  action: GameActionUnion;
  resolve: (value: any) => void;
  reject: (error: GameError) => void;
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
  public enqueue<T>(action: GameActionUnion): Promise<T> {
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
  private canProcessAction(action: GameActionUnion): boolean {
    // Check for duplicate actions in queue
    const duplicates = this.queue.filter(qa => 
      qa.action.type === action.type &&
      qa.action.gameId === action.gameId
    );

    if (duplicates.length > 1) {
      return false;
    }

    // Check for conflicting actions
    const conflicts = this.queue.some(qa => {
      // Can't have multiple moves in queue
      if (qa.action.type === GameActionType.MAKE_MOVE && 
          action.type === GameActionType.MAKE_MOVE) {
        return true;
      }

      // Can't end turn while move is pending
      if (qa.action.type === GameActionType.MAKE_MOVE && 
          action.type === GameActionType.END_TURN) {
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
          code: ErrorCode.OPERATION_FAILED,
          message: 'Conflicting operation in progress',
          severity: ErrorSeverity.MEDIUM,
          details: { action }
        } as GameError;
      }

      // Process action (in MVP we just resolve immediately)
      resolve(action);

      // Remove processed action
      this.queue.shift();
    } catch (error) {
      // Handle error
      const gameError = error as GameError;
      this.errorManager.handleError(gameError);
      reject(gameError);
      
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
        code: ErrorCode.OPERATION_CANCELLED,
        message: 'Operation cancelled - queue cleared',
        severity: ErrorSeverity.LOW
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
  public isActionPending(type: GameActionType): boolean {
    return this.queue.some(qa => qa.action.type === type);
  }
}