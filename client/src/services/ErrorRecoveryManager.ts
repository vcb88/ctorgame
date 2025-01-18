/**
 * Error Recovery Manager
 * 
 * Handles network errors and provides recovery strategies:
 * - Retry: Attempts to retry failed operations with optional backoff
 * - Reconnect: Handles connection loss and reconnection
 * - Reset: Handles game state reset when needed
 * - User Action: Prompts user for action when needed
 * 
 * Uses NetworkError type from shared module which includes:
 * - retryCount: number of retry attempts made
 * - retryable: whether the error can be retried
 * - timestamp: when the error occurred
 * - details: additional error-specific information
 */

import type { ErrorCode, ErrorSeverity, NetworkError, BaseError } from '@ctor-game/shared/types/base/types.js';
import { createNetworkError } from '../utils/errors.js';

// Тип для расширенных опций логирования
interface ExtendedLogOptions {
    // Общие поля
    component: string;
    timestamp: number;
    // Опциональные поля с информацией
    currentState?: unknown;
    update?: unknown;
    error?: unknown;
    listenerCount?: number;
    retryCount?: number;
    hasConfig?: boolean;
    maxRetries?: number;
    shouldRetry?: boolean;
    delay?: number;
    useBackoff?: boolean;
    state?: unknown;
};

type RecoveryStrategy = 'RETRY' | 'RECONNECT' | 'RESET' | 'USER_ACTION' | 'NOTIFY';

interface ErrorRecoveryConfig {
    maxRetries?: number;
    retryDelay?: number;
    useBackoff?: boolean;
    recover?: (error: NetworkError) => Promise<void>;
}
import { logger } from '@/utils/logger.js';

/**
 * Default recovery configurations for different error types
 */
const DEFAULT_RECOVERY_CONFIGS: Record<ErrorCode, ErrorRecoveryConfig> = {
  'NETWORK_ERROR': {
    maxRetries: 3,
    retryDelay: 1000,
    useBackoff: true
  },
  'OPERATION_TIMEOUT': {
    maxRetries: 2,
    retryDelay: 2000,
    useBackoff: true
  },
  'VALIDATION_ERROR': {
    maxRetries: 0
  },
  'GAME_ERROR': {
    maxRetries: 1,
    retryDelay: 1000
  },
  'STORAGE_ERROR': {
    maxRetries: 2,
    retryDelay: 1000
  },
  'OPERATION_FAILED': {
    maxRetries: 2,
    retryDelay: 1000
  },
  'REDIS_CONNECTION_ERROR': {
    maxRetries: 3,
    retryDelay: 1000,
    useBackoff: true
  },
  'REDIS_CLIENT_ERROR': {
    maxRetries: 2,
    retryDelay: 1000
  },
  'INVALID_EVENT': {},
  'INVALID_DATA': {},
  'INVALID_STATE': {},
  'INTERNAL_ERROR': {},
  'GAME_NOT_FOUND': {},
  'REDIS_ERROR': {}
};

export class ErrorRecoveryManager {
  private static instance: ErrorRecoveryManager;
  private errorListeners: Set<(error: NetworkError) => void> = new Set();
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
  public async handleError(error: NetworkError): Promise<void> {
    logger.error('Handling error', {
      code: error.code,
      message: error.message,
      severity: error.severity,
      details: error.details
    });

    // Ensure error has correct attributes
    const timestamp = Date.now();
    const normalizedError: NetworkError = {
      ...error,
      timestamp: error.timestamp || timestamp,
      retryable: error.retryable ?? this.isErrorRecoverable(error),
      retryCount: error.retryCount || 0,
      details: error.details || {}
    };

    // Notify listeners
    this.notifyListeners(normalizedError);

    // Skip recovery for low severity errors or non-recoverable errors
    if (normalizedError.severity === 'warning' || !normalizedError.retryable) {
      logger.debug('Skipping error recovery', {
        severity: normalizedError.severity,
        retryable: normalizedError.retryable
      });
      return;
    }

    const strategy = this.getRecoveryStrategy(normalizedError);
    logger.debug('Selected recovery strategy', { strategy, errorCode: normalizedError.code });
    
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
  private isErrorRecoverable(error: NetworkError): boolean {
    const nonRecoverableErrors = [
      'VALIDATION_ERROR',
      'GAME_NOT_FOUND',
      'INVALID_STATE',
      'INVALID_DATA'
    ];
    const isRecoverable = !nonRecoverableErrors.includes(error.code);
    logger.debug('Checking error recoverability', {
      component: 'ErrorRecoveryManager',
      data: { errorCode: error.code, isRecoverable }
    });
    return isRecoverable;
  }

  /**
   * Determine if error should be retried
   */
  public shouldRetry(error: NetworkError): boolean {
    const config = this.recoveryConfigs[error.code];
    if (!config || !config.maxRetries) {
      logger.debug('Error not eligible for retry', {
        errorCode: error.code,
        hasConfig: !!config,
        maxRetries: config?.maxRetries
      });
      return false;
    }

    const retryCount = error.retryCount || 0;
    const shouldRetry = retryCount < config.maxRetries;
    logger.debug('Checking retry eligibility', {
      errorCode: error.code,
      retryCount,
      maxRetries: config.maxRetries,
      shouldRetry
    });
    return shouldRetry;
  }

  /**
   * Get recovery strategy for error
   */
  public getRecoveryStrategy(error: NetworkError): RecoveryStrategy {
    // Handle critical errors that need user action
    if (error.severity === 'critical') {
      return 'USER_ACTION';
    }

    // Handle network and connection errors
    if (error.code === 'NETWORK_ERROR' || error.code === 'REDIS_CONNECTION_ERROR') {
      return 'RECONNECT';
    }

    // Handle operation errors that can be retried
    if (error.code === 'OPERATION_FAILED' || error.code === 'OPERATION_TIMEOUT') {
      return 'RETRY';
    }

    // Handle state errors
    if (error.code === 'INVALID_STATE') {
      return 'RESET';
    }

    // Default to just notification
    return 'NOTIFY';
  }

  /**
   * Add error listener
   */
  public addErrorListener(listener: (error: NetworkError) => void): () => void {
    this.errorListeners.add(listener);
    logger.debug('Error listener added');
    return () => {
      this.errorListeners.delete(listener);
      logger.debug('Error listener removed');
    };
  }

  /**
   * Configure recovery options for error type
   */
  public configureRecovery(code: ErrorCode, config: ErrorRecoveryConfig): void {
    logger.debug('Configuring error recovery', {
      errorCode: code,
      config
    });
    this.recoveryConfigs[code] = {
      ...DEFAULT_RECOVERY_CONFIGS[code],
      ...config
    };
  }

  private notifyListeners(error: NetworkError): void {
    logger.debug('Notifying error listeners', {
      listenerCount: this.errorListeners.size,
      errorCode: error.code
    });
    this.errorListeners.forEach(listener => {
      try {
        listener(error);
      } catch (listenerError) {
        logger.error('Error in listener', {
          errorCode: error.code,
          listenerError
        });
      }
    });
  }

  private async handleRetry(error: NetworkError): Promise<void> {
    const config = this.recoveryConfigs[error.code];
    if (!this.shouldRetry(error)) {
      logger.debug('Maximum retry attempts exceeded', {
        errorCode: error.code,
        retryCount: error.retryCount
      });
      this.notifyListeners(createNetworkError(
        error.code,
        'Maximum retry attempts exceeded',
        'critical',
        error.details,
        false,
        error.retryCount
      ));
      return;
    }

    const retryCount = (error.retryCount || 0) + 1;
    const delay = config.useBackoff && config.retryDelay
      ? config.retryDelay * Math.pow(2, retryCount - 1)
      : config.retryDelay || 1000;

    logger.debug('Attempting retry', {
      errorCode: error.code,
      retryCount,
      delay,
      useBackoff: config.useBackoff
    });

    await new Promise(resolve => setTimeout(resolve, delay));

    if (config.recover) {
      try {
        await config.recover({
          ...error,
          retryCount,
          retryable: true,
          timestamp: Date.now()
        });
        logger.debug('Recovery action successful', {
          errorCode: error.code,
          retryCount
        });
      } catch (recoverError) {
        logger.error('Recovery action failed', {
          errorCode: error.code,
          retryCount,
          error: recoverError
        });
        throw recoverError;
      }
    }
  }

  private async handleReconnect(error: NetworkError): Promise<void> {
    // В MVP просто уведомляем о необходимости переподключения
    const timestamp = Date.now();
    logger.warn('Connection error occurred', {
      errorCode: error.code,
      message: error.message,
      details: error.details
    });

    this.notifyListeners(createNetworkError(
      error.code,
      error.message || 'Connection lost. Please refresh the page to reconnect.',
      'error',
      {
        ...error.details,
        reconnectAttempt: (error.retryCount || 0) + 1
      },
      true,
      error.retryCount
    ));
  }

  private async handleReset(error: NetworkError): Promise<void> {
    // В MVP просто уведомляем о необходимости сброса
    const timestamp = Date.now();
    logger.warn('State error occurred', {
      errorCode: error.code,
      message: error.message,
      details: error.details
    });

    this.notifyListeners(createNetworkError(
      error.code,
      error.message || 'Game state error. Please refresh the page to reset.',
      'error',
      {
        ...error.details,
        resetAttempt: (error.retryCount || 0) + 1
      },
      true,
      error.retryCount
    ));
  }

  private handleUserAction(error: NetworkError): void {
    // В MVP просто показываем сообщение пользователю
    const timestamp = Date.now();
    logger.warn('User action required', {
      errorCode: error.code,
      message: error.message,
      details: error.details
    });

    this.notifyListeners(createNetworkError(
      error.code,
      error.message ? `${error.message} Please take appropriate action.` : 'Action required from user',
      'critical',
      {
        ...error.details,
        requiresUserAction: true
      },
      false,
      error.retryCount
    ));
  }
}