const express = require('express');
const { createServer } = require('http');
const { GameServer } = require('./websocket/GameServer');
const path = require('path');

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