const DEBUG = true;

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
  component?: string;
  event?: string;
  data?: unknown;
  context?: {
    gameId?: string;
    playerId?: string;
    socketId?: string;
    timestamp?: string;
    [key: string]: any;  // Allow additional context properties
  };
  results?: unknown;     // For operation results
  error?: unknown;       // For error details
  gameState?: unknown;   // For game state information
  connection?: unknown;  // For connection details
  storage?: unknown;     // For storage operations
  room?: unknown;        // For room operations
  notification?: unknown; // For notification details
  waitingPhase?: unknown; // For waiting phase information
  player?: unknown;      // For player information
  [key: string]: any;    // Allow additional top-level properties
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

export const logger = {
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
    log('error', formatMessage('error', message, options));
  },

  gameState: (state: unknown, context: LogOptions['context']) => {
    if (DEBUG) {
      console.debug(formatMessage('debug', 'Game state update', {
        component: 'GameState',
        context,
        data: state
      }));
    }
  },

  socketEvent: (event: string, data: unknown, direction: 'in' | 'out', context: LogOptions['context']) => {
    if (DEBUG) {
      console.debug(formatMessage('debug', `Socket ${direction === 'in' ? 'received' : 'sending'} event`, {
        component: 'WebSocket',
        event,
        context,
        data
      }));
    }
  },

  move: (data: unknown, context: LogOptions['context']) => {
    if (DEBUG) {
      console.debug(formatMessage('debug', 'Processing move', {
        component: 'GameLogic',
        context,
        data
      }));
    }
  },

  db: (operation: string, data: unknown, context?: LogOptions['context']) => {
    if (DEBUG) {
      console.debug(formatMessage('debug', `Database operation: ${operation}`, {
        component: 'Database',
        context,
        data
      }));
    }
  }
};