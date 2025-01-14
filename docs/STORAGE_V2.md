# Game Storage System Documentation (v2)

## Overview

The game storage system uses MongoDB for both metadata and move history storage, with Redis for real-time state management.

## Storage Structure

### MongoDB Collections

#### 1. games
Stores game metadata and configuration.

```typescript
interface GameMetadata {
    // Identification
    gameId: string;              // Unique game identifier
    code: string;                // 4-digit connection code

    // Status
    status: GameStatus;          // 'waiting' | 'playing' | 'finished'
    startTime: string;           // ISO timestamp
    endTime?: string;            // ISO timestamp for finished games
    lastActivityAt: string;      // ISO timestamp of last action
    expiresAt: string;          // ISO timestamp when game expires

    // Players
    players: {
        first?: string;         // First player's ID
        second?: string;        // Second player's ID
    };

    // Game configuration
    boardSize: {                // Board dimensions
        width: number;
        height: number;
    };

    // Statistics
    totalTurns: number;         // Total number of turns played
    duration?: number;          // Game duration in seconds
    winner?: Player;            // Winner (only for finished games)
    finalScore?: {             // Final score (only for finished games)
        [Player.First]: number;
        [Player.Second]: number;
    };
}
```

#### 2. moves
Stores complete move history for each game.

```typescript
interface GameMove {
    gameId: string;           // Reference to the game
    player: Player;           // Player making the move
    type: 'place' | 'replace'; // Move type
    position: {
        x: number;           // X coordinate
        y: number;           // Y coordinate
    };
    timestamp: number;       // Move timestamp in milliseconds
}
```

### Redis Storage

Used for real-time game state management with automatic expiration.

```typescript
interface RedisGameState {
    board: number[][];         // Current board state
    currentPlayer: Player;     // Current active player
    opsRemaining: number;      // Operations remaining in current turn
    status: GameStatus;        // Current game status
    lastMoveAt: number;        // Last activity timestamp
    winner?: Player;           // Winner if game is finished
}
```

## MongoDB Indexes

```javascript
// games collection
db.games.createIndex({ "gameId": 1 }, { unique: true });
db.games.createIndex({ "code": 1 }, { unique: true });
db.games.createIndex({ "status": 1 });
db.games.createIndex({ "lastActivityAt": 1 });
db.games.createIndex({ "expiresAt": 1 });
db.games.createIndex({ "status": 1, "lastActivityAt": 1 });

// moves collection
db.moves.createIndex({ "gameId": 1 });
db.moves.createIndex({ "gameId": 1, "timestamp": 1 });
```

## Service Architecture

### GameStorageService
Handles persistent storage operations.

```typescript
interface GameStorageService {
    // Connection management
    connect(): Promise<void>;
    disconnect(): Promise<void>;

    // Game management
    createGame(playerId: string, gameId: string): Promise<GameMetadata>;
    joinGame(gameIdOrCode: string, playerId: string): Promise<GameMetadata>;
    
    // Move management
    recordMove(gameId: string, move: GameMove): Promise<void>;
    
    // Game completion
    finishGame(gameId: string, winner: Player, finalScore: Record<Player, number>): Promise<void>;
    
    // History
    getGameHistory(gameId: string): Promise<GameHistory>;
    
    // Maintenance
    cleanupExpiredGames(): Promise<number>;
}
```

### GameService
Coordinates between storage, state management, and game logic.

```typescript
interface GameService {
    // Initialization
    initialize(): Promise<void>;
    disconnect(): Promise<void>;

    // Game lifecycle
    createGame(playerId: string, gameId: string): Promise<GameMetadata>;
    joinGame(gameId: string, playerId: string): Promise<GameMetadata>;
    makeMove(gameId: string, player: Player, move: GameMove): Promise<IGameState>;
    finishGame(gameId: string, winner: Player, finalScore: Record<Player, number>): Promise<void>;
    expireGame(gameId: string): Promise<void>;
}
```

## Performance Monitoring

All operations include performance monitoring:
- Operation duration tracking
- Success/failure logging
- Error context preservation
- Resource usage monitoring

Example log entry:
```json
{
    "event": "move_made",
    "gameId": "abc123",
    "player": 1,
    "moveType": "place",
    "position": {"x": 3, "y": 4},
    "duration": 127,
    "timestamp": "2024-01-04T12:34:56.789Z"
}
```

## Error Handling

Storage operations include comprehensive error handling:
- Connection failures
- Concurrent modification
- Data validation
- Resource limits
- Timeout handling

Example error handling:
```typescript
try {
    await storageService.recordMove(gameId, move);
} catch (error) {
    logger.error('Failed to record move', {
        error: toErrorWithStack(error),
        gameId,
        move,
        duration: Date.now() - startTime
    });
    throw new GameStorageError(`Failed to record move: ${error.message}`);
}
```

## Usage Examples

### Creating and Starting Game

```typescript
// Create new game
const game = await gameService.createGame("player1_id", "game123");
console.log(`Game created with code: ${game.code}`);

// Join game
const joinedGame = await gameService.joinGame("game123", "player2_id");
```

### Making Moves

```typescript
// Make a move
const newState = await gameService.makeMove("game123", Player.First, {
    type: 'place',
    position: { x: 3, y: 4 },
    player: Player.First,
    timestamp: Date.now()
});

// Check game completion
if (newState.gameOver) {
    await gameService.finishGame("game123", newState.winner!, newState.scores);
}
```

### Getting Game History

```typescript
// Get complete game history
const history = await storageService.getGameHistory("game123");
console.log(`Total moves: ${history.moves.length}`);
console.log(`Game duration: ${history.metadata.duration} seconds`);
```