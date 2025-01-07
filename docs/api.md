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
   - Game state preserved in Redis
   - Move validation with distributed locks
   - Atomic operations for consistency

3. State Persistence:
   - All game states saved in Redis with AOF
   - Move history in Redis Lists
   - Real-time state sync via Pub/Sub
   - TTL-based automatic cleanup

## Redis Data Structures

### Game State
```typescript
// Key: game:{gameId}:state
interface GameState {
    board: number[][];           // Game board
    currentPlayer: number;       // Active player
    currentTurn: {
        placeOperationsLeft: number;
        moves: GameMove[];
    };
    score: {
        player1: number;
        player2: number;
    };
    gameOver: boolean;
    winner: number | null;
    lastUpdate: number;          // Timestamp
}
```

### Move History
```typescript
// Key: game:{gameId}:moves (Redis List)
interface GameMove {
    type: 'PLACE' | 'REPLACE';
    x: number;
    y: number;
    playerNumber: number;
    timestamp: number;
}
```

### State Management with Redis
1. Game Creation:
   ```typescript
   // 1. Acquire lock for game creation
   const lock = await redis.acquireLock('create:game');
   try {
     // 2. Generate unique game code
     const gameId = generateUniqueId();
     
     // 3. Create initial state
     const initialState = createInitialState();
     
     // 4. Store state with transaction
     await redis.multi()
       .hset(`game:${gameId}:state`, initialState)
       .sadd('games:active', gameId)
       .exec();
   } finally {
     await redis.releaseLock(lock);
   }
   ```

2. Move Processing:
   ```typescript
   // 1. Acquire game state lock
   const lock = await redis.acquireLock(`game:${gameId}:lock`);
   try {
     // 2. Get and validate current state
     const state = await redis.hgetall(`game:${gameId}:state`);
     validateMove(state, move);
     
     // 3. Apply move and update state
     const newState = applyMove(state, move);
     
     // 4. Save state and move atomically
     await redis.multi()
       .hset(`game:${gameId}:state`, newState)
       .lpush(`game:${gameId}:moves`, move)
       .publish(`game:${gameId}:events`, { type: 'MOVE', data: move })
       .exec();
   } finally {
     await redis.releaseLock(lock);
   }
   ```

3. Game Completion:
   ```typescript
   // 1. Update game state
   await redis.multi()
     .hset(`game:${gameId}:state`, { 
       ...finalState,
       gameOver: true,
       winner
     })
     // 2. Move from active to finished games
     .srem('games:active', gameId)
     .sadd('games:finished', gameId)
     // 3. Set TTL for cleanup
     .expire(`game:${gameId}:state`, COMPLETED_GAME_TTL)
     .expire(`game:${gameId}:moves`, COMPLETED_GAME_TTL)
     .exec();
   ```

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