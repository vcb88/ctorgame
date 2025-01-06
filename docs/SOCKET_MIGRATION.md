# Socket.IO Migration Guide

## Overview
This document describes the migration from WebSocket to Socket.IO in the CTORGame project.

## Changes

### Server-side Changes
1. Replaced aiohttp WebSocket with python-socketio
2. Added room-based game management
3. Improved error handling and reconnection support
4. Added automatic room cleanup on disconnection

### Client-side Changes
1. Updated useSocket hook with proper typing
2. Added comprehensive event handlers
3. Improved reconnection logic
4. Added proper cleanup on unmount

## New Features

### Reconnection Support
- Automatic reconnection attempts (up to 5 times)
- State recovery on reconnection
- Proper room rejoining

### Room Management
- Automatic room creation and joining
- Room-based message broadcasting
- Proper cleanup on player departure

### Error Handling
- Structured error responses
- Type-safe error handling
- Proper error propagation to UI

## Events

### Server to Client
- `connected`: Connection established
- `error`: Error occurred
- `gameCreated`: New game created
- `gameJoined`: Successfully joined game
- `gameStarted`: Game started (both players joined)
- `gameUpdated`: Game state updated
- `playerLeft`: Player left the game
- `playerDisconnected`: Player connection lost
- `playerReconnected`: Player reconnected
- `gameReconnected`: Successfully reconnected to game

### Client to Server
- `createGame`: Create new game
- `joinGame`: Join existing game
- `makeMove`: Make a game move
- `leaveGame`: Leave current game
- `reconnect`: Reconnect to existing game

## Testing
- Added comprehensive test suite for both client and server
- Added Socket.IO specific mocks
- Added room management tests
- Added reconnection tests

## Usage Example

```typescript
const { socket, reconnectToGame } = useSocket({
    onConnected: () => console.log('Connected'),
    onGameCreated: (gameId, code) => {
        console.log(`Game created: ${gameId}, code: ${code}`);
    },
    onGameStarted: (gameId, state) => {
        console.log(`Game started: ${gameId}`);
        setGameState(state);
    },
    onGameUpdated: (gameId, update) => {
        console.log(`Game updated: ${gameId}`);
        updateGameState(update);
    }
});
```

## Migration Steps
1. Install required dependencies
2. Replace WebSocket server with Socket.IO server
3. Update client code to use Socket.IO events
4. Update tests with Socket.IO specific mocks
5. Test reconnection scenarios
6. Update documentation