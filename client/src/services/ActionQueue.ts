import { ErrorRecoveryManager } from './ErrorRecoveryManager.js';
import type { GameAction, GameMove, NetworkError, UUID } from '@ctor-game/shared/types/core.js';
import { createNetworkError } from '../utils/errors.js';

/**
 * Game action types supported by the queue
 */
export type QueuedGameAction = 
    | { type: 'CREATE_GAME'; timestamp: number; }
    | { type: 'JOIN_GAME'; gameId: UUID; timestamp: number; }
    | { type: 'MAKE_MOVE'; gameId: UUID; move: GameMove; timestamp: number; }
    | { type: 'END_TURN'; gameId: UUID; timestamp: number; };

interface QueuedAction<T = unknown> {
    readonly action: QueuedGameAction;
    readonly resolve: (value: unknown) => void;
    readonly reject: (error: NetworkError) => void;
    readonly timestamp: number;
}

/**
 * Manages game actions queue to prevent race conditions
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
    public enqueue<T>(action: QueuedGameAction): Promise<T> {
        const timestamp = action.timestamp || Date.now();
        return new Promise<T>((resolve, reject) => {
            // Add action to queue
            this.queue.push({
                action,
                resolve: resolve as (value: unknown) => void,
                reject,
                timestamp
            });

            // Try to process queue
            this.processQueue();
        });
    }

    /**
     * Check if action can be processed
     */
    private canProcessAction(action: QueuedGameAction): boolean {
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
        const { action, resolve, reject, timestamp } = this.queue[0];

        try {
            // Check if action can be processed
            if (!this.canProcessAction(action)) {
                throw createNetworkError(
                    'OPERATION_FAILED',
                    'Conflicting operation in progress',
                    'error',
                    { action }
                );
            }

            // Process action (in MVP we just resolve immediately)
            resolve(action as unknown);

            // Remove processed action
            this.queue.shift();
        } catch (error) {
            // Handle error
            const clientError = createNetworkError(
                'OPERATION_FAILED',
                error instanceof Error ? error.message : 'Operation failed',
                'error',
                { error, action }
            );

            this.errorManager.handleError(clientError);
            reject(clientError);
            
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
        const timestamp = Date.now();
        this.queue.forEach(({ reject }) => {
            reject(createNetworkError(
                'OPERATION_TIMEOUT',
                'Operation cancelled - queue cleared',
                'warning'
            ));
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
    public isActionPending(type: string): boolean {
        return this.queue.some(qa => qa.action.type === type);
    }
}