import express from 'express';
import { createServer } from 'http';
import { GameServer } from './websocket/GameServer';
import path from 'path';

const app = express();
const httpServer = createServer(app);

// Serve static files from the client build directory
app.use(express.static(path.join(__dirname, '../../client/dist')));

// Create WebSocket game server
new GameServer(httpServer);

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});