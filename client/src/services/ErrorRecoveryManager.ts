import { 
  ErrorCode,
  ErrorSeverity,
  RecoveryStrategy,
  INetworkError,
  IErrorRecoveryConfig
} from '@ctor-game/shared/src/types/network/errors.js';

/**
 * Default recovery configurations for different error types
 */
const DEFAULT_RECOVERY_CONFIGS: Record<ErrorCode, IErrorRecoveryConfig> = {
  'CONNECTION_ERROR': {
    maxRetries: 3,
    retryDelay: 1000,
    useBackoff: true
  },
  'CONNECTION_TIMEOUT': {
    maxRetries: 2,
    retryDelay: 2000,
    useBackoff: true
  },
  'CONNECTION_LOST': {
    maxRetries: 5,
    retryDelay: 1000,
    useBackoff: true
  },
  'OPERATION_FAILED': {
    maxRetries: 2,
    retryDelay: 1000
  },
  'OPERATION_TIMEOUT': {
    maxRetries: 1,
    retryDelay: 2000
  },
  // Other errors default to no retries
  'OPERATION_CANCELLED': {},
  'INVALID_MOVE': {},
  'INVALID_STATE': {},
  'GAME_NOT_FOUND': {},
  'GAME_FULL': {},
  'STATE_VALIDATION_ERROR': {},
  'STATE_TRANSITION_ERROR': {},
  'STORAGE_ERROR': {},
  'UNKNOWN_ERROR': {}
};

export class ErrorRecoveryManager {
  private static instance: ErrorRecoveryManager;
  private errorListeners: Set<(error: INetworkError) => void> = new Set();
  private recoveryConfigs: Record<ErrorCode, IErrorRecoveryConfig>;
  
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
  public async handleError(error: INetworkError): Promise<void> {
    // Ensure error has correct attributes
    const timestamp = Date.now();
    const normalizedError: INetworkError = {
      ...error,
      timestamp: error.timestamp || timestamp,
      recoverable: error.recoverable ?? this.isErrorRecoverable(error),
      retryCount: error.retryCount || 0
    };

    // Notify listeners
    this.notifyListeners(normalizedError);

    // Skip recovery for low severity errors or non-recoverable errors
    if (normalizedError.severity === 'LOW' || !normalizedError.recoverable) {
      return;
    }

    const strategy = this.getRecoveryStrategy(normalizedError);
    
    switch (strategy) {
      case 'RETRY':
        await this.handleRetry(normalizedError);
        break;
      
      case 'RECONNECT':
        await this.handleReconnect(normalizedError);
        break;
      
      case 'RESET':
        await this.handleReset(normalizedError);
        break;
      
      case 'USER_ACTION':
        this.handleUserAction(normalizedError);
        break;
      
      case 'NOTIFY':
      default:
        // Just notification was already done
        break;
    }
  }

  /**
   * Check if error is recoverable based on its code
   */
  private isErrorRecoverable(error: INetworkError): boolean {
    return !['OPERATION_CANCELLED', 'GAME_NOT_FOUND', 'GAME_FULL', 'INVALID_STATE'].includes(error.code);
  }

  /**
   * Determine if error should be retried
   */
  public shouldRetry(error: INetworkError): boolean {
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
  public getRecoveryStrategy(error: INetworkError): RecoveryStrategy {
    // Handle critical errors that need user action
    if (error.severity === 'CRITICAL') {
      return 'USER_ACTION';
    }

    // Handle connection errors
    if (error.code.startsWith('CONNECTION_')) {
      return 'RECONNECT';
    }

    // Handle operation errors that can be retried
    if (
      error.code.startsWith('OPERATION_') && 
      error.code !== 'OPERATION_CANCELLED'
    ) {
      return 'RETRY';
    }

    // Handle state errors
    if (error.code.startsWith('STATE_')) {
      return 'RESET';
    }

    // Default to just notification
    return 'NOTIFY';
  }

  /**
   * Add error listener
   */
  public addErrorListener(listener: (error: INetworkError) => void): () => void {
    this.errorListeners.add(listener);
    return () => {
      this.errorListeners.delete(listener);
    };
  }

  /**
   * Configure recovery options for error type
   */
  public configureRecovery(code: ErrorCode, config: IErrorRecoveryConfig): void {
    this.recoveryConfigs[code] = {
      ...DEFAULT_RECOVERY_CONFIGS[code],
      ...config
    };
  }

  private notifyListeners(error: INetworkError): void {
    this.errorListeners.forEach(listener => listener(error));
  }

  private async handleRetry(error: INetworkError): Promise<void> {
    const config = this.recoveryConfigs[error.code];
    if (!this.shouldRetry(error)) {
      this.notifyListeners({
        ...error,
        message: 'Maximum retry attempts exceeded',
        severity: 'HIGH',
        recoverable: false,
        timestamp: Date.now()
      });
      return;
    }

    const retryCount = (error.retryCount || 0) + 1;
    const delay = config.useBackoff && config.retryDelay
      ? config.retryDelay * Math.pow(2, retryCount - 1)
      : config.retryDelay || 1000;

    await new Promise(resolve => setTimeout(resolve, delay));

    if (config.recover) {
      await config.recover({
        ...error,
        retryCount,
        recoverable: true,
        timestamp: Date.now()
      });
    }
  }

  private async handleReconnect(error: INetworkError): Promise<void> {
    // В MVP просто уведомляем о необходимости переподключения
    const timestamp = Date.now();
    this.notifyListeners({
      ...error,
      message: error.message || 'Connection lost. Please refresh the page to reconnect.',
      severity: 'HIGH',
      recoverable: true,
      timestamp,
      retryCount: error.retryCount || 0
    });
  }

  private async handleReset(error: INetworkError): Promise<void> {
    // В MVP просто уведомляем о необходимости сброса
    const timestamp = Date.now();
    this.notifyListeners({
      ...error,
      message: error.message || 'Game state error. Please refresh the page to reset.',
      severity: 'HIGH',
      recoverable: true,
      timestamp,
      retryCount: error.retryCount || 0
    });
  }

  private handleUserAction(error: INetworkError): void {
    // В MVP просто показываем сообщение пользователю
    const timestamp = Date.now();
    this.notifyListeners({
      ...error,
      message: error.message ? `${error.message} Please take appropriate action.` : 'Action required from user',
      severity: 'CRITICAL',
      recoverable: false,
      timestamp,
      retryCount: error.retryCount || 0
    });
  }
}