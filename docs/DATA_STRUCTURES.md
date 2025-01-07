# Data Structures and Storage Documentation

## Overview

The project uses a hybrid storage approach:
- Redis for active game states
- MongoDB for game history
- NPZ files for detailed game data

## Data Types

### Coordinate System

```typescript
interface IPosition {
  x: number;  // X coordinate (0-9)
  y: number;  // Y coordinate (0-9)
}

interface IBoardSize {
  width: number;   // Board width (default: 10)
  height: number;  // Board height (default: 10)
}

interface IBoard {
  cells: number[][];  // 2D array of cell values
  size: IBoardSize;   // Board dimensions
}
```

### Game State

```typescript
interface IGameState {
  board: IBoard;
  gameOver: boolean;
  winner: number | null;
  currentTurn: {
    placeOperationsLeft: number;
    moves: IGameMove[];
  };
  scores: {
    player1: number;
    player2: number;
  };
  isFirstTurn: boolean;
}

interface IGameMove {
  type: 'place' | 'replace';
  position: IPosition;
}
```

## Storage Systems

### Redis (Active Games)

Key patterns:
- `game:{gameId}:state` - Current game state
- `game:{gameId}:room` - Room information
- `player:{socketId}:session` - Player session data
- `game:{gameId}:events` - Game events queue

TTL settings:
- Game state: 1 hour
- Player session: 2 hours
- Room: 1 hour
- Events: 1 hour

### MongoDB (Game History)

Collections:
1. `games`:
```typescript
interface GameMetadata {
  gameId: string;
  code: string;
  status: 'waiting' | 'playing' | 'finished';
  startTime: string;
  endTime?: string;
  duration?: number;
  lastActivityAt: string;
  expiresAt: string;
  players: {
    first?: string;
    second?: string;
  };
  winner?: number;
  finalScore?: {
    player1: number;
    player2: number;
  };
  totalTurns: number;
  boardSize: IBoardSize;
}
```

2. `metrics`:
```typescript
interface GameMetrics {
  gameId: string;
  timestamp: string;
  metrics: {
    averageMoveTime: number;
    replacementsCount: number;
    territoryControl: {
      player1: number[];
      player2: number[];
    };
    piecesCaptured: {
      player1: number;
      player2: number;
    };
  };
}
```

### NPZ Files (Detailed History)

Structure:
```
storage/
├── games/
│   └── YYYY/           # Year
│       └── MM/         # Month
│           └── DD/     # Day
│               └── {game_id}.npz
```

File contents:
1. `moves`: Game moves history
2. `board_history`: Board states history
3. `metadata`: Game metadata (JSON)
4. `game_details`: Detailed game data (JSON)

## Data Flow

1. Active Game:
   - Game state stored in Redis
   - Player sessions in Redis
   - Real-time events via Redis Pub/Sub

2. Game Completion:
   - Final state saved to MongoDB
   - Detailed history saved to NPZ
   - Redis data marked for cleanup

3. History Access:
   - Recent games from MongoDB
   - Detailed analysis from NPZ files
   - Metrics aggregation from both

## Implementation Details

### Game State Management

```typescript
// Create new game
await Promise.all([
  redisService.createGame(gameId, initialState),
  storageService.createGame(playerId)
]);

// Record move
await Promise.all([
  redisService.updateGameState(gameId, newState),
  storageService.recordMove(gameId, move)
]);

// End game
await Promise.all([
  storageService.finishGame(gameId, winner, finalScore),
  redisService.cleanupGame(gameId)
]);
```

### Data Validation

All data structures are validated using TypeScript interfaces and runtime validation functions:

```typescript
function validateGameMove(move: IGameMove, size: IBoardSize): boolean;
function validateGameState(state: IGameState): boolean;
function validatePosition(pos: IPosition, size: IBoardSize): boolean;
```

### Game Events

Events used for real-time game updates:
```typescript
enum GameEventType {
    MOVE = 'move',
    DISCONNECT = 'disconnect',
    RECONNECT = 'reconnect',
    END_TURN = 'end_turn'
}

interface IGameEvent {
    type: GameEventType;
    gameId: string;
    playerId: string;
    data: Record<string, any>;
    timestamp: number;
}
```

### Error Handling

Standard error format:
```typescript
interface GameError {
  code: string;
  message: string;
  details?: any;
}
```

Common error codes:
- `INVALID_MOVE`
- `INVALID_STATE`
- `STATE_NOT_FOUND`
- `GAME_EXPIRED`