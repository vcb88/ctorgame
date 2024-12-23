# API Documentation

TODO: Document API endpoints and WebSocket events

## Discovered WebSocket Events

### Client to Server Events
- `createGame`: Request to create a new game room
- `joinGame`: Request to join an existing game room with gameId
- `makeMove`: Send a move (row, col) to the server
- `disconnect`: Handled automatically by Socket.IO

### Server to Client Events
- `gameCreated`: Response with new gameId
- `gameStarted`: Notification when both players joined
- `gameStateUpdated`: Updated game state after moves
- `playerDisconnected`: Notification when opponent disconnects
- `error`: Error messages for various conditions

## Data Types

### GameState
```typescript
interface GameState {
  board: (number | null)[][];
  gameOver: boolean;
  winner: number | null;
}
```

### Player
```typescript
interface Player {
  id: string;
  number: number;
}
```

### Move
```typescript
interface Move {
  row: number;
  col: number;
}
```

### GameRoom
```typescript
interface GameRoom {
  gameId: string;
  players: Player[];
  currentState: GameState;
  currentPlayer: number;
}
```

TODO: Add more detailed API documentation, including:
- Request/Response examples
- Error codes and messages
- Rate limiting information
- Authentication (when implemented)
- REST API endpoints (when added)