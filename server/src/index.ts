// Debug log to track module loading
console.log('Loading index.ts module at:', new Date().toISOString(), '| Module path:', __filename);

import 'reflect-metadata';
import express from 'express';
import http from 'http';
import { GameServer } from './websocket/GameServer.js';
import cors from 'cors';
import path from 'path';
import { logger } from './utils/logger.js';
import { toErrorWithStack } from '@ctor-game/shared/src/utils/errors.js';

logger.info('Starting server initialization', {
  component: 'Server',
  context: {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch
  }
});

// Logger middleware
const requestLogger = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Skip logging for health check requests
  if (req.path === '/health') {
    next();
    return;
  }

  const start = Date.now();
  logger.debug('Incoming request', {
    component: 'HTTP',
    context: {
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      body: req.body,
      query: req.query
    }
  });

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.debug('Response sent', {
      component: 'HTTP',
      context: {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration
      }
    });
  });

  // Add CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }

  next();
};

logger.info('Creating Express application', { component: 'Server' });
const app = express();
logger.info('Adding middleware', { component: 'Server' });
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Simple ping endpoint
app.get('/ping', (_req, res) => {
  logger.debug('Ping endpoint called', { component: 'HTTP' });
  res.json({ message: 'pong', timestamp: new Date().toISOString() });
});

// Info endpoint
app.get('/info', (_req, res) => {
  logger.debug('Info endpoint called', { component: 'HTTP' });
  const info = {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    pid: process.pid,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    env: process.env.NODE_ENV
  };
  logger.debug('Server info', { component: 'HTTP', data: info });
  res.json(info);
});

// Simple test endpoint
app.get('/test', (_req, res) => {
  logger.debug('Test endpoint called', {
    component: 'HTTP',
    context: { serverReady: isServerReady }
  });
  if (!isServerReady) {
    logger.warn('Server not ready, returning 503', { component: 'HTTP' });
    res.status(503).json({ 
      status: 'starting',
      message: 'Server is starting...'
    });
    return;
  }
  res.json({ 
    status: 'ok',
    message: 'Server is responding'
  });
});

// Health check endpoint - no logging to reduce noise
app.get('/health', (_req, res) => {
  if (!isServerReady) {
    res.status(503).json({ 
      status: 'starting',
      timestamp: new Date().toISOString(),
      message: 'Server is starting...'
    });
    return;
  }
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

let isServerReady = false;

logger.info('Creating HTTP server', { component: 'Server' });
const httpServer = http.createServer(app);

httpServer.on('listening', () => {
  const addr = httpServer.address();
  logger.info('HTTP server is now listening', {
    component: 'Server',
    context: { serverDetails: addr }
  });
});

// Log only critical HTTP connection events
httpServer.on('connection', (socket) => {
  socket.on('error', (err) => {
    logger.error('Socket error', {
      component: 'Server',
      context: { socketId: socket.remoteAddress },
      error: toErrorWithStack(err)
    });
  });
});

logger.info('Setting up static files', { component: 'Server' });
// Serve static files from the client build directory
app.use(express.static(path.join(__dirname, '../../client/dist')));

logger.info('Initializing WebSocket server', { component: 'Server' });
// Create WebSocket game server using singleton pattern
// Initialize WebSocket game server
GameServer.getInstance(httpServer);

const PORT = process.env.PORT || 3000;
logger.info('Server configuration', {
  component: 'Server',
  context: { port: PORT }
});

// Log any uncaught errors
process.on('unhandledRejection', (error: Error) => {
  logger.error('Unhandled Promise Rejection', {
    component: 'Process',
    error: toErrorWithStack(error)
  });
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception', {
    component: 'Process',
    error: toErrorWithStack(error)
  });
});

// Add error handler for the http server
httpServer.on('error', (error: Error) => {
  logger.error('HTTP Server Error', {
    component: 'Server',
    error: toErrorWithStack(error)
  });
});

// Register basic error handlers
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Request error', {
    component: 'HTTP',
    context: {
      method: req.method,
      url: req.originalUrl
    },
    error: toErrorWithStack(err)
  });
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Register 404 handler
app.use((req: express.Request, res: express.Response) => {
  logger.warn('404 Not Found', {
    component: 'HTTP',
    context: {
      method: req.method,
      url: req.originalUrl
    }
  });
  res.status(404).json({ error: 'Not Found', message: `Cannot ${req.method} ${req.originalUrl}` });
});

try {
  logger.info('Starting HTTP server', {
    component: 'Server',
    context: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      pid: process.pid,
      cwd: process.cwd()
    }
  });
  
  httpServer.listen(Number(PORT), () => {
    isServerReady = true;  // Set server as ready after successful start
    
    logger.info('Server started successfully', {
      component: 'Server',
      context: {
        environment: process.env.NODE_ENV,
        uid: process.getuid?.(),
        url: `http://0.0.0.0:${PORT}`,
        endpoints: [
          `GET http://localhost:${PORT}/test (test endpoint)`,
          `GET http://localhost:${PORT}/health (health check)`
        ]
      }
    });
  });
} catch (error) {
  logger.error('Failed to start server', {
    component: 'Server',
    error: toErrorWithStack(error)
  });
  process.exit(1);
}