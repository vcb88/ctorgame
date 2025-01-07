import 'reflect-metadata';
import express from 'express';
import { createServer } from 'http';
import { GameServer } from './websocket/GameServer';
import path from 'path';

// Logger middleware
const requestLogger = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
};

const app = express();
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const httpServer = createServer(app);

// Serve static files from the client build directory
app.use(express.static(path.join(__dirname, '../../client/dist')));

// Create WebSocket game server
new GameServer(httpServer);

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});