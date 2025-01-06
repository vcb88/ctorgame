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

## Request/Response Examples

### Creating a Game
```typescript
// Client -> Server
socket.emit('createGame');

// Server -> Client
socket.on('gameCreated', { gameId: string });
```

### Joining a Game
```typescript
// Client -> Server
socket.emit('joinGame', { gameId: string });

// Server -> Client (success)
socket.on('gameStarted', {
  gameState: IGameState,
  currentPlayer: number
});

// Server -> Client (error)
socket.on('error', { message: string });
```

### Making a Move
```typescript
// Client -> Server
socket.emit('makeMove', {
  gameId: string,
  move: IMove
});

// Server -> Client (success)
socket.on('gameStateUpdated', {
  gameState: IGameState,
  currentPlayer: number
});
```

## Error Handling

### WebSocket Error Events
The server emits 'error' events with the following message types:

1. Game Creation/Join Errors:
   ```typescript
   { message: 'Game not found' }        // When trying to join non-existent game
   { message: 'Game is full' }          // When trying to join full game
   ```

2. Game Play Errors:
   ```typescript
   { message: 'Player not found in game' }  // Invalid player
   { message: 'Not your turn' }             // Wrong player move
   { message: 'Game is over' }              // Move after game end
   { message: 'Invalid move' }              // Move validation failed
   ```

### Connection Error Handling
1. Socket Disconnection:
   - Server detects disconnection
   - Notifies other player
   - Preserves game state for 5 minutes
   - Allows reconnection with same game code within timeout
   - Cleans up game room after timeout

2. Network Issues:
   - Socket.IO handles automatic reconnection
   - Game state preserved in database and memory
   - Move validation prevents duplicate moves
   - Transaction support for critical operations

3. State Persistence:
   - All game states saved in PostgreSQL
   - Move history tracked for replay
   - Real-time state sync between servers
   - Automatic cleanup of expired games

## Database Schema

### Games Table
```sql
CREATE TABLE games (
    id UUID PRIMARY KEY,
    game_code VARCHAR(10) UNIQUE NOT NULL,
    current_state JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP,
    winner INTEGER
);
```

### Moves Table
```sql
CREATE TABLE moves (
    id SERIAL PRIMARY KEY,
    game_id UUID REFERENCES games(id),
    player_number INTEGER NOT NULL,
    move_data JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### State Management
1. Game Creation:
   - Generate unique game code
   - Create initial game state
   - Store in both database and memory

2. Moves:
   - Validate move
   - Update game state atomically
   - Store move history
   - Broadcast updates

3. Game Completion:
   - Mark game as completed
   - Record winner
   - Preserve final state
   - Start cleanup timer

## Future Improvements

1. Authentication
   - Player session management
   - Secure game access
   - User profiles and statistics

2. Rate Limiting
   - Per-IP connection limits
   - Move frequency limits
   - Room creation restrictions

3. REST API
   - Game history endpoint
   - Player statistics
   - Room management
   - Session handling