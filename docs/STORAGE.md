# Game Storage System Documentation

## Overview

The game storage system uses a hybrid approach combining MongoDB for metadata and file system storage for detailed game data.

## Storage Structure

### MongoDB Collections

#### 1. games
Stores game metadata and quick access information.

```typescript
interface GameMetadata {
    gameId: string;           // Unique game identifier
    code: string;            // 4-digit connection code
    status: GameStatus;      // 'waiting' | 'playing' | 'finished'
    startTime: string;       // ISO datetime
    endTime?: string;        // ISO datetime
    duration?: number;       // Game duration in seconds
    lastActivityAt: string;  // ISO datetime
    expiresAt: string;      // ISO datetime
    players: {
        first?: string;      // First player ID
        second?: string;     // Second player ID
    };
    winner?: 1 | 2;         // Winner player number
    finalScore: {           // Final score
        player1: number;    // First player score
        player2: number;    // Second player score
    };
    totalTurns: number;     // Total number of turns
    boardSize: {            // Board dimensions
        width: number;
        height: number;
    };
}
```

#### 2. metrics
Stores game statistics and analytics data.

```typescript
interface GameMetrics {
    gameId: string;
    timestamp: string;      // ISO datetime
    metrics: {
        averageMoveTime: number;
        replacementsCount: number;
        territoryControl: {
            player1: number[];    // Territory control history for player 1
            player2: number[];    // Territory control history for player 2
        };
        piecesCaptured: {
            player1: number;      // Pieces captured by player 1
            player2: number;      // Pieces captured by player 2
        };
    };
}
```

### File System Storage

Games are stored in NPZ format (compressed NumPy array format) with the following structure:

```
storage/
├── games/
│   └── YYYY/           # Year
│       └── MM/         # Month
│           └── DD/     # Day
│               └── {game_id}.npz
```

#### NPZ File Structure

Each .npz file contains:

1. `moves`: NumPy array with moves data
   ```typescript
   interface Move {
       player: 1 | 2;      // Player number
       x: number;          // X coordinate
       y: number;          // Y coordinate
       timestamp: number;  // Unix timestamp
   }
   ```

2. `board_history`: NumPy array with board states
   ```typescript
   type BoardState = number[][];  // 2D array of cell values
   ```

3. `metadata`: JSON string with game metadata
   ```typescript
   interface GameMetadata {
       // Same as MongoDB game metadata
   }
   ```

4. `game_details`: JSON string with detailed game information
   ```typescript
   interface GameDetails {
       moves: Array<{
           player: 1 | 2;
           x: number;
           y: number;
           timestamp: number;
           replacements: Array<[number, number]>;
       }>;
       timing: {
           moveTimes: number[];
           avgMoveTime: number;
       };
       territoryHistory: Array<{
           player1: number;
           player2: number;
       }>;
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
db.games.createIndex({ 
    "status": 1, 
    "lastActivityAt": 1 
});

// metrics collection
db.metrics.createIndex({ "gameId": 1 });
db.metrics.createIndex({ "timestamp": -1 });
```

## API Methods

### Storage Service Methods

```typescript
interface GameStorageService {
    // Game management
    createGame(playerId: string): Promise<GameMetadata>;
    joinGame(code: string, playerId: string): Promise<GameMetadata>;
    getGame(gameId: string): Promise<GameMetadata>;
    updateGame(gameId: string, update: Partial<GameMetadata>): Promise<void>;
    
    // Move management
    recordMove(gameId: string, move: Move): Promise<void>;
    getGameMoves(gameId: string): Promise<Move[]>;
    
    // Game history
    saveGameHistory(gameId: string, history: GameDetails): Promise<void>;
    getGameHistory(gameId: string): Promise<GameDetails>;
    
    // Maintenance
    cleanupExpiredGames(): Promise<void>;
    getActiveGamesCount(): Promise<number>;
}
```

### File Operations

```typescript
interface GameFileOperations {
    saveMoves(gameId: string, moves: Move[]): Promise<void>;
    saveBoard(gameId: string, board: number[][]): Promise<void>;
    saveGameDetails(gameId: string, details: GameDetails): Promise<void>;
    loadGameFile(gameId: string): Promise<{
        moves: Move[];
        board_history: number[][][];
        details: GameDetails;
    }>;
}
```

## Usage Examples

### Creating a New Game

```typescript
const storage = new GameStorageService();

// Create new game
const game = await storage.createGame("player1_id");
console.log(`Game created with code: ${game.code}`);

// Join existing game
const joinedGame = await storage.joinGame("1234", "player2_id");
```

### Recording Moves

```typescript
// Record a move
await storage.recordMove(gameId, {
    player: 1,
    x: 3,
    y: 4,
    timestamp: Date.now()
});

// Get game history
const history = await storage.getGameHistory(gameId);
```

### Maintenance

```typescript
// Cleanup expired games (run periodically)
await storage.cleanupExpiredGames();

// Check active games count
const activeGames = await storage.getActiveGamesCount();
if (activeGames >= 50) {
    throw new Error("Maximum number of concurrent games reached");
}
```