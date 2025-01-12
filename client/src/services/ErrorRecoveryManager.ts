import { 
  GameError, 
  ErrorCode, 
  ErrorSeverity, 
  RecoveryStrategy,
  ErrorRecoveryConfig 
} from '../../../shared/types/errors';

/**
 * Default recovery configurations for different error types
 */
const DEFAULT_RECOVERY_CONFIGS: Record<ErrorCode, ErrorRecoveryConfig> = {
  [ErrorCode.CONNECTION_ERROR]: {
    maxRetries: 3,
    retryDelay: 1000,
    useBackoff: true
  },
  [ErrorCode.CONNECTION_TIMEOUT]: {
    maxRetries: 2,
    retryDelay: 2000,
    useBackoff: true
  },
  [ErrorCode.CONNECTION_LOST]: {
    maxRetries: 5,
    retryDelay: 1000,
    useBackoff: true
  },
  [ErrorCode.OPERATION_FAILED]: {
    maxRetries: 2,
    retryDelay: 1000
  },
  [ErrorCode.OPERATION_TIMEOUT]: {
    maxRetries: 1,
    retryDelay: 2000
  },
  // Other errors default to no retries
  [ErrorCode.OPERATION_CANCELLED]: {},
  [ErrorCode.INVALID_MOVE]: {},
  [ErrorCode.INVALID_STATE]: {},
  [ErrorCode.GAME_NOT_FOUND]: {},
  [ErrorCode.GAME_FULL]: {},
  [ErrorCode.STATE_VALIDATION_ERROR]: {},
  [ErrorCode.STATE_TRANSITION_ERROR]: {},
  [ErrorCode.STORAGE_ERROR]: {},
  [ErrorCode.UNKNOWN_ERROR]: {}
};

export class ErrorRecoveryManager {
  private static instance: ErrorRecoveryManager;
  private errorListeners: Set<(error: GameError) => void> = new Set();
  private recoveryConfigs: Record<ErrorCode, ErrorRecoveryConfig>;
  
  private constructor() {
    this.recoveryConfigs = { ...DEFAULT_RECOVERY_CONFIGS };
  }

  public static getInstance(): ErrorRecoveryManager {
    if (!ErrorRecoveryManager.instance) {
      ErrorRecoveryManager.instance = new ErrorRecoveryManager();
    }
    return ErrorRecoveryManager.instance;
  }

  /**
   * Handle an error and determine recovery strategy
   */
  public async handleError(error: GameError): Promise<void> {
    // Ensure error has timestamp
    error.timestamp = error.timestamp || Date.now();

    // Notify listeners
    this.notifyListeners(error);

    // Skip recovery for low severity errors
    if (error.severity === ErrorSeverity.LOW) {
      return;
    }

    const strategy = this.getRecoveryStrategy(error);
    
    switch (strategy) {
      case RecoveryStrategy.RETRY:
        await this.handleRetry(error);
        break;
      
      case RecoveryStrategy.RECONNECT:
        await this.handleReconnect(error);
        break;
      
      case RecoveryStrategy.RESET:
        await this.handleReset(error);
        break;
      
      case RecoveryStrategy.USER_ACTION:
        this.handleUserAction(error);
        break;
      
      case RecoveryStrategy.NOTIFY:
      default:
        // Just notification was already done
        break;
    }
  }

  /**
   * Determine if error should be retried
   */
  public shouldRetry(error: GameError): boolean {
    const config = this.recoveryConfigs[error.code];
    if (!config || !config.maxRetries) {
      return false;
    }

    const retryCount = error.retryCount || 0;
    return retryCount < config.maxRetries;
  }

  /**
   * Get recovery strategy for error
   */
  public getRecoveryStrategy(error: GameError): RecoveryStrategy {
    // Handle critical errors that need user action
    if (error.severity === ErrorSeverity.CRITICAL) {
      return RecoveryStrategy.USER_ACTION;
    }

    // Handle connection errors
    if (error.code.startsWith('CONNECTION_')) {
      return RecoveryStrategy.RECONNECT;
    }

    // Handle operation errors that can be retried
    if (
      error.code.startsWith('OPERATION_') && 
      error.code !== ErrorCode.OPERATION_CANCELLED
    ) {
      return RecoveryStrategy.RETRY;
    }

    // Handle state errors
    if (error.code.startsWith('STATE_')) {
      return RecoveryStrategy.RESET;
    }

    // Default to just notification
    return RecoveryStrategy.NOTIFY;
  }

  /**
   * Add error listener
   */
  public addErrorListener(listener: (error: GameError) => void): () => void {
    this.errorListeners.add(listener);
    return () => {
      this.errorListeners.delete(listener);
    };
  }

  /**
   * Configure recovery options for error type
   */
  public configureRecovery(code: ErrorCode, config: ErrorRecoveryConfig): void {
    this.recoveryConfigs[code] = {
      ...DEFAULT_RECOVERY_CONFIGS[code],
      ...config
    };
  }

  private notifyListeners(error: GameError): void {
    this.errorListeners.forEach(listener => listener(error));
  }

  private async handleRetry(error: GameError): Promise<void> {
    const config = this.recoveryConfigs[error.code];
    if (!this.shouldRetry(error)) {
      return;
    }

    const retryCount = (error.retryCount || 0) + 1;
    const delay = config.useBackoff
      ? config.retryDelay! * Math.pow(2, retryCount - 1)
      : config.retryDelay!;

    await new Promise(resolve => setTimeout(resolve, delay));

    if (config.recover) {
      await config.recover({ ...error, retryCount });
    }
  }

  private async handleReconnect(error: GameError): Promise<void> {
    // В MVP просто уведомляем о необходимости переподключения
    this.notifyListeners({
      ...error,
      message: 'Connection lost. Please refresh the page to reconnect.',
      severity: ErrorSeverity.HIGH
    });
  }

  private async handleReset(error: GameError): Promise<void> {
    // В MVP просто уведомляем о необходимости сброса
    this.notifyListeners({
      ...error,
      message: 'Game state error. Please refresh the page to reset.',
      severity: ErrorSeverity.HIGH
    });
  }

  private handleUserAction(error: GameError): void {
    // В MVP просто показываем сообщение пользователю
    this.notifyListeners({
      ...error,
      message: `${error.message} Please take appropriate action.`,
      severity: ErrorSeverity.CRITICAL
    });
  }
}