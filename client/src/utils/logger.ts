const DEBUG = true;

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
  component?: string;
  event?: string;
  data?: unknown;
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

  parts.push(message);

  if (options.data !== undefined) {
    parts.push('\nData:', JSON.stringify(options.data, null, 2));
  }

  return parts.join(' ');
};

export const logger = {
  debug: (message: string, options: LogOptions = {}) => {
    if (DEBUG) {
      console.debug(formatMessage('debug', message, options));
    }
  },

  info: (message: string, options: LogOptions = {}) => {
    console.info(formatMessage('info', message, options));
  },

  warn: (message: string, options: LogOptions = {}) => {
    console.warn(formatMessage('warn', message, options));
  },

  error: (message: string, options: LogOptions = {}) => {
    console.error(formatMessage('error', message, options));
  },

  gameState: (state: unknown, component: string) => {
    if (DEBUG) {
      console.debug(formatMessage('debug', 'Game state updated', {
        component,
        data: state
      }));
    }
  },

  socketEvent: (event: string, data: unknown, direction: 'in' | 'out') => {
    if (DEBUG) {
      console.debug(formatMessage('debug', `Socket ${direction === 'in' ? 'received' : 'sending'} event`, {
        component: 'WebSocket',
        event,
        data
      }));
    }
  },

  userAction: (action: string, data: unknown) => {
    if (DEBUG) {
      console.debug(formatMessage('debug', 'User action', {
        component: 'UserInterface',
        event: action,
        data
      }));
    }
  }
};