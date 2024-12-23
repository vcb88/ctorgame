# Development Guide

## Project Structure Details

### Server Configuration
The server part requires specific configuration for proper TypeScript and module system setup:

```json
// server/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",  // Important: Using CommonJS for better compatibility
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "skipLibCheck": true
  }
}
```

### Server Dependencies
Server requires the following core dependencies:
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.7.2"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.5",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.3.3"
  }
}
```

## Known Development Issues

1. ESM vs CommonJS
   - The project uses a mix of ESM (client) and CommonJS (server) modules
   - Server must be configured to use CommonJS to avoid module loading issues
   - Client continues to use ESM as per Vite defaults

2. Development Server Setup
   - Client dev server runs on port 5173 (Vite default)
   - Server runs on port 3000
   - CORS is enabled in development for WebSocket connections

## Local Development Tips

1. Using pnpm
   - Project uses pnpm as the package manager
   - Dependencies must be installed separately in root, client, and server directories
   - Local installation can be done with `npx pnpm` if global installation is not possible

2. Running in Development Mode
   - Server and client should be started in separate terminals
   - Server uses ts-node-dev for automatic reloading
   - Client uses Vite's development server

## Found Undocumented Features

1. WebSocket Implementation
   - Server implements CORS with all origins allowed ("*")
   - Supports reconnection to existing game sessions
   - Handles player disconnections with game state cleanup

2. Game Logic
   - Uses a 3x3 grid for the game board
   - Supports two players with numbers 0 and 1
   - Includes win detection for rows, columns, and diagonals
   - Handles draw conditions when board is full

## Missing Documentation

The following aspects need better documentation:

1. Database Integration
   - PostgreSQL setup and schema not implemented yet
   - Redis integration for session management missing

2. Testing
   - No test configuration or examples provided
   - Need to document testing strategy and setup

3. Client-Server Communication
   - Need to document all WebSocket events and their payloads
   - Error handling and recovery procedures should be documented

This documentation will be updated as new information is discovered or implementation details are added.