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
    const errorData = {
      ...options,
      data: {
        ...(options.data || {}),
        stack: (options.data && 'stack' in options.data ? options.data.stack : undefined) || new Error().stack
      }
    };
    console.error(formatMessage('error', message, errorData));
  },

  errorWithContext: (error: any, context: string, additionalData?: unknown) => {
    const errorData = {
      component: context,
      data: {
        message: error.message || error,
        code: error.code,
        type: error.constructor.name,
        stack: error.stack,
        additional: additionalData
      }
    };
    console.error(formatMessage('error', 'Error occurred', errorData));
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

  userAction: (action: string, data?: unknown) => {
    if (DEBUG) {
      console.debug(formatMessage('debug', 'User action', {
        component: 'UserInterface',
        event: action,
        data
      }));
    }
  },

  // New logging methods
  animation: (type: string, data: unknown, component: string) => {
    if (DEBUG) {
      console.debug(formatMessage('debug', `Animation event: ${type}`, {
        component,
        event: 'animation',
        data
      }));
    }
  },

  componentState: (component: string, changes: Record<string, unknown>) => {
    if (DEBUG) {
      console.debug(formatMessage('debug', 'Component state changed', {
        component,
        data: changes
      }));
    }
  },

  validation: (component: string, result: { valid: boolean; reason?: string }, data?: unknown) => {
    if (DEBUG) {
      console.debug(formatMessage('debug', 'Validation check', {
        component,
        event: result.valid ? 'validation_success' : 'validation_failure',
        data: {
          reason: result.reason,
          details: data
        }
      }));
    }
  },

  operation: (type: string, status: 'start' | 'complete' | 'error', data?: unknown) => {
    if (DEBUG) {
      console.debug(formatMessage('debug', `Operation ${status}`, {
        component: 'GameOperation',
        event: type,
        data
      }));
    }
  },

  // Enhanced state logging
  stateManager: {
    update: (component: string, prevState: unknown, nextState: unknown, action?: string) => {
      if (DEBUG) {
        console.debug(formatMessage('debug', 'State update', {
          component,
          event: action || 'update',
          data: {
            prev: prevState,
            next: nextState,
            changes: getStateChanges(prevState, nextState)
          }
        }));
      }
    },

    transition: (from: string, to: string, trigger: string, context?: unknown) => {
      if (DEBUG) {
        console.debug(formatMessage('debug', 'State transition', {
          component: 'GameStateManager',
          event: 'transition',
          data: {
            from,
            to,
            trigger,
            context
          }
        }));
      }
    },

    error: (error: unknown, state: unknown, context: string) => {
      logger.errorWithContext(error, 'GameStateManager', {
        currentState: state,
        context
      });
    }
  },

  // Enhanced network logging
  network: {
    send: (event: string, data: unknown, meta?: unknown) => {
      if (DEBUG) {
        console.debug(formatMessage('debug', 'Network message sent', {
          component: 'NetworkManager',
          event,
          data: {
            payload: data,
            meta,
            timestamp: Date.now()
          }
        }));
      }
    },

    receive: (event: string, data: unknown, meta?: unknown) => {
      if (DEBUG) {
        console.debug(formatMessage('debug', 'Network message received', {
          component: 'NetworkManager',
          event,
          data: {
            payload: data,
            meta,
            timestamp: Date.now()
          }
        }));
      }
    },

    error: (error: unknown, context: { event?: string; data?: unknown }) => {
      logger.errorWithContext(error, 'NetworkManager', context);
    },

    latency: (duration: number, event?: string) => {
      if (DEBUG) {
        console.debug(formatMessage('debug', 'Network latency', {
          component: 'NetworkManager',
          event: event || 'latency',
          data: { duration }
        }));
      }
    }
  }
};

// Utility function to compute state changes
function getStateChanges(prev: any, next: any): Record<string, { from: any; to: any }> {
  const changes: Record<string, { from: any; to: any }> = {};
  
  if (typeof prev !== 'object' || typeof next !== 'object') {
    return changes;
  }

  const allKeys = new Set([...Object.keys(prev), ...Object.keys(next)]);
  
  for (const key of allKeys) {
    if (prev[key] !== next[key]) {
      changes[key] = {
        from: prev[key],
        to: next[key]
      };
    }
  }
  
  return changes;
}