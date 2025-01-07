import 'reflect-metadata';
import express from 'express';
import { createServer } from 'http';
import { GameServer } from './websocket/GameServer';
import path from 'path';

console.log('Starting server initialization...');

// Logger middleware
const requestLogger = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const start = Date.now();
  console.log(`[REQUEST] ${req.method} ${req.originalUrl} - Started`);
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[RESPONSE] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
};

console.log('Creating Express application...');
const app = express();
console.log('Adding middleware...');
app.use(requestLogger);

// Simple test endpoint
app.get('/test', (req, res) => {
  console.log('Test endpoint called');
  res.json({ message: 'Server is responding' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  // Отправляем 503 пока сервер не готов принимать соединения
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
const httpServer = createServer(app);

console.log('Setting up static files...');
// Serve static files from the client build directory
app.use(express.static(path.join(__dirname, '../../client/dist')));

console.log('Initializing WebSocket server...');
// Create WebSocket game server
new GameServer(httpServer);

const PORT = process.env.PORT || 3000;
console.log(`Will listen on port ${PORT}`);

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

try {
  console.log('Starting HTTP server...');
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running at http://0.0.0.0:${PORT}`);
    console.log('Available endpoints:');
    console.log(`- GET http://localhost:${PORT}/test (test endpoint)`);
    console.log(`- GET http://localhost:${PORT}/health (health check)`);
  });
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}