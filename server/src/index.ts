import 'reflect-metadata';
import express from 'express';
import http from 'http';
import { GameServer } from './websocket/GameServer';
import cors from 'cors';
import path from 'path';

console.log('Starting server initialization...');

// Logger middleware
const requestLogger = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Skip logging for health check requests
  if (req.path === '/health') {
    next();
    return;
  }

  const start = Date.now();
  console.log('=== Incoming Request ===');
  console.log(`Method: ${req.method}`);
  console.log(`URL: ${req.originalUrl}`);
  console.log(`Headers:`, req.headers);
  console.log(`Body:`, req.body);
  console.log(`Query:`, req.query);
  console.log('======================');

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log('=== Response Sent ===');
    console.log(`Status: ${res.statusCode}`);
    console.log(`Duration: ${duration}ms`);
    console.log('===================');
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

console.log('Creating Express application...');
const app = express();
console.log('Adding middleware...');
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Simple ping endpoint
app.get('/ping', (req, res) => {
  console.log('Ping endpoint called');
  res.json({ message: 'pong', timestamp: new Date().toISOString() });
});

// Info endpoint
app.get('/info', (req, res) => {
  console.log('Info endpoint called');
  res.json({
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    pid: process.pid,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    env: process.env.NODE_ENV
  });
});

// Simple test endpoint
app.get('/test', (req, res) => {
  console.log(`Test endpoint called. Server ready: ${isServerReady}`);
  if (!isServerReady) {
    console.log('Server not ready yet, returning 503');
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
app.get('/health', (req, res) => {
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

console.log('Creating HTTP server...');
const httpServer = http.createServer(app);

httpServer.on('listening', () => {
  console.log('HTTP server is now listening');
  const addr = httpServer.address();
  console.log('Server details:', addr);
});

// Логирование только критичных событий HTTP-соединений
httpServer.on('connection', (socket) => {
  socket.on('error', (err) => console.error('Socket error:', err));
});

console.log('Setting up static files...');
// Serve static files from the client build directory
app.use(express.static(path.join(__dirname, '../../client/dist')));

console.log('Initializing WebSocket server...');
// Create WebSocket game server and store the instance
const gameServer = new GameServer(httpServer);

const PORT = process.env.PORT || 3000;
console.log(`Will listen on port ${PORT}`);

// Log any uncaught errors
process.on('unhandledRejection', (error: Error) => {
  console.error('Unhandled Promise Rejection:', error);
  console.error(error.stack);
});

process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  console.error(error.stack);
});

// Add error handler for the http server
httpServer.on('error', (error: Error) => {
  console.error('HTTP Server Error:', error);
  console.error(error.stack);
});

// Register basic error handlers
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error handling request:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Register 404 handler
app.use((req: express.Request, res: express.Response) => {
  console.log('404 Not Found:', req.originalUrl);
  res.status(404).json({ error: 'Not Found', message: `Cannot ${req.method} ${req.originalUrl}` });
});

try {
  console.log('Starting HTTP server...');
  console.log('Node version:', process.version);
  console.log('Platform:', process.platform);
  console.log('Architecture:', process.arch);
  console.log('Process ID:', process.pid);
  console.log('Current directory:', process.cwd());
  
  httpServer.listen(Number(PORT), () => {
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Process running as: ${process.getuid?.()}`);
    console.log('Server network interfaces:');
    isServerReady = true;  // Set server as ready after successful start
    console.log(`🚀 Server is running at http://0.0.0.0:${PORT}`);
    console.log('Available endpoints:');
    console.log(`- GET http://localhost:${PORT}/test (test endpoint)`);
    console.log(`- GET http://localhost:${PORT}/health (health check)`);
  });
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}