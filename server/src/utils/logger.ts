import { ErrorWithStack } from '../types/error';

const DEBUG = true;

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface GameLogger {
  state: (action: string, state: unknown, context?: Record<string, unknown>) => void;
  move: (action: string, move: unknown, context: Record<string, unknown>) => void;
  validation: (result: boolean, reason: string, context: Record<string, unknown>) => void;
  performance: (operation: string, duration: number, context?: Record<string, unknown>) => void;
}

interface StorageLogger {
  operation: (action: string, data: unknown, context?: Record<string, unknown>) => void;
  error: (error: ErrorWithStack, context: Record<string, unknown>) => void;
}

interface NetworkLogger {
  socketEvent: (event: string, data: unknown, direction: 'in' | 'out', context: LogOptions['context']) => void;
  error: (error: ErrorWithStack, context: Record<string, unknown>) => void;
}

interface DBLogger {
  operation: (action: string, data: unknown, context?: Record<string, unknown>) => void;
  error: (error: ErrorWithStack, context: Record<string, unknown>) => void;
}

interface Logger {
  debug: (message: string, options?: LogOptions) => void;
  info: (message: string, options?: LogOptions) => void;
  warn: (message: string, options?: LogOptions) => void;
  error: (message: string, options?: LogOptions) => void;
  game: GameLogger;
  storage: StorageLogger;
  network: NetworkLogger;
  db: DBLogger;
}

type ErrorWithStack = Error | { 
  stack?: string; 
  message?: string; 
  type?: string;
  code?: string | number;
  [key: string]: unknown; 
};

interface LogOptions {
  component?: string;
  event?: string;
  data?: unknown;
  context?: {
    gameId?: string;
    playerId?: string;
    socketId?: string;
    timestamp?: string;
    move?: unknown;
    state?: unknown;
    error?: ErrorWithStack;
    duration?: number;
    [key: string]: any;
  };
  results?: unknown;
  error?: ErrorWithStack;
  gameState?: unknown;
  connection?: unknown;
  storage?: unknown;
  room?: unknown;
  notification?: unknown;
  waitingPhase?: unknown;
  player?: unknown;
  performance?: {
    startTime?: number;
    endTime?: number;
    duration?: number;
  };
  [key: string]: any;
}

const getTimestamp = () => new Date().toISOString();

const formatMessage = (level: LogLevel, message: string, options: LogOptions = {}) => {
  const parts = [
    `[${getTimestamp()}]`,
    `[${level.toUpperCase()}]`
  ];

  if (options.component) {
    parts.push(`[${options.component}]`);
  }

  if (options.event) {
    parts.push(`[${options.event}]`);
  }

  if (options.context) {
    const contextParts = [];
    if (options.context.gameId) contextParts.push(`game:${options.context.gameId}`);
    if (options.context.playerId) contextParts.push(`player:${options.context.playerId}`);
    if (options.context.socketId) contextParts.push(`socket:${options.context.socketId}`);
    if (contextParts.length > 0) {
      parts.push(`[${contextParts.join('|')}]`);
    }
  }

  parts.push(message);

  let result = parts.join(' ');

  if (options.data !== undefined) {
    try {
      // Попытка отформатировать данные как JSON с отступами
      const formattedData = typeof options.data === 'string' 
        ? options.data 
        : JSON.stringify(options.data, null, 2);
      result += '\nData: ' + formattedData;
    } catch (e) {
      // Если не удалось преобразовать в JSON, выводим как есть
      result += '\nData: ' + String(options.data);
    }
  }

  // Добавляем разделитель для лучшей читаемости
  result += '\n----------------------------------------\n';

  return result;
};

// Функция для немедленного вывода в консоль
const log = (level: LogLevel, message: string) => {
  process.stdout.write(message);
  process.stdout.write('\n');
};

export const logger: Logger = {
  debug: (message: string, options: LogOptions = {}) => {
    if (DEBUG) {
      log('debug', formatMessage('debug', message, options));
    }
  },

  info: (message: string, options: LogOptions = {}) => {
    log('info', formatMessage('info', message, options));
  },

  warn: (message: string, options: LogOptions = {}) => {
    log('warn', formatMessage('warn', message, options));
  },

  error: (message: string, options: LogOptions = {}) => {
    const errorData = {
      ...options,
      context: {
        ...(options.context || {}),
        stack: options.error?.stack || new Error().stack,
        timestamp: new Date().toISOString()
      }
    };
    log('error', formatMessage('error', message, errorData));
  },

  game: {
    state: (action: string, state: unknown, context?: Record<string, unknown>) => {
      if (DEBUG) {
        log('debug', formatMessage('debug', `Game state ${action}`, {
          component: 'GameState',
          context: {
            ...context,
            timestamp: new Date().toISOString()
          },
          data: state
        }));
      }
    },

    move: (action: string, move: unknown, context: Record<string, unknown>) => {
      if (DEBUG) {
        log('debug', formatMessage('debug', `Game move ${action}`, {
          component: 'GameLogic',
          context: {
            ...context,
            timestamp: new Date().toISOString()
          },
          data: { move }
        }));
      }
    },

    validation: (result: boolean, reason: string, context: Record<string, unknown>) => {
      if (DEBUG) {
        log('debug', formatMessage('debug', 'Move validation', {
          component: 'GameLogic',
          context: {
            ...context,
            timestamp: new Date().toISOString()
          },
          data: { valid: result, reason }
        }));
      }
    },

    performance: (operation: string, duration: number, context?: Record<string, unknown>) => {
      if (DEBUG) {
        log('debug', formatMessage('debug', 'Performance metric', {
          component: 'Performance',
          context: {
            ...context,
            operation,
            duration,
            timestamp: new Date().toISOString()
          }
        }));
      }
    }
  },

  storage: {
    operation: (action: string, data: unknown, context?: Record<string, unknown>) => {
      if (DEBUG) {
        log('debug', formatMessage('debug', `Storage ${action}`, {
          component: 'Storage',
          context: {
            ...context,
            timestamp: new Date().toISOString()
          },
          data
        }));
      }
    },

    error: (error: unknown, context: Record<string, unknown>) => {
      const errorWithStack = error as ErrorWithStack;
      log('error', formatMessage('error', 'Storage error', {
        component: 'Storage',
        context: {
          ...context,
          stack: errorWithStack?.stack || 'No stack trace available',
          timestamp: new Date().toISOString()
        },
        error: errorWithStack
      }));
    }
  },

  network: {
    socketEvent: (event: string, data: unknown, direction: 'in' | 'out', context: LogOptions['context']) => {
      if (DEBUG) {
        log('debug', formatMessage('debug', `Socket ${direction === 'in' ? 'received' : 'sending'} event`, {
          component: 'WebSocket',
          event,
          context: {
            ...context,
            timestamp: new Date().toISOString()
          },
          data
        }));
      }
    },

    error: (error: unknown, context: Record<string, unknown>) => {
      const errorWithStack = error as ErrorWithStack;
      log('error', formatMessage('error', 'Network error', {
        component: 'Network',
        context: {
          ...context,
          stack: errorWithStack?.stack || 'No stack trace available',
          timestamp: new Date().toISOString()
        },
        error: errorWithStack
      }));
    }
  },

  db: {
    operation: (action: string, data: unknown, context?: Record<string, unknown>) => {
      if (DEBUG) {
        log('debug', formatMessage('debug', `Database ${action}`, {
          component: 'Database',
          context: {
            ...context,
            timestamp: new Date().toISOString()
          },
          data
        }));
      }
    },

    error: (error: unknown, context: Record<string, unknown>) => {
      const errorWithStack = error as ErrorWithStack;
      log('error', formatMessage('error', 'Database error', {
        component: 'Database',
        context: {
          ...context,
          stack: errorWithStack?.stack || 'No stack trace available',
          timestamp: new Date().toISOString()
        },
        error: errorWithStack
      }));
    }
  }
};