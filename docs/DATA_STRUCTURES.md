# Data Structures and Storage Documentation

## Overview

The project uses a hybrid storage approach:
- Redis for active game states
- MongoDB for game history
- NPZ files for detailed game data

## Data Types

### Core Types

```typescript
/** Base interface for objects with numeric values */
interface INumeric {
    readonly value: number;
}

/** Base interface for objects with unique identifiers */
interface IIdentifiable {
    readonly id: string;
}

/** Base interface for objects with timestamps */
interface ITimestamped {
    readonly timestamp: number;
}

/** Base interface for validatable objects */
interface IValidatable {
    readonly valid: boolean;
    readonly message?: string;
}
```

### Geometric Types

```typescript
/** Position on the game board */
interface IPosition {
    readonly x: number;
    readonly y: number;
}

/** Board dimensions */
interface ISize {
    readonly width: number;
    readonly height: number;
}

/** Extended position with validity check */
interface IBoardPosition {
    readonly position: IPosition;
    readonly valid: boolean; // Indicates if position is within board bounds
}

/** Board cell with value */
interface IBoardCell {
    readonly position: IPosition;
    readonly value: number | null;
}
```

### Game Types

```typescript
/** Game state enum as union type */
type GameStatus = 'waiting' | 'playing' | 'finished';

/** Operation type enum as union type */
type OperationType = 'place' | 'replace';

/** Player number as literal type */
type PlayerNumber = 1 | 2;

/** Player information */
interface IPlayer extends IIdentifiable {
    readonly number: PlayerNumber;
    readonly connected: boolean;
}

/** Game move structure */
interface IGameMove {
    readonly type: OperationType;
    readonly position: IPosition;
    readonly player: PlayerNumber;
}

/** Game scores structure */
interface IGameScores {
    readonly player1: number;
    readonly player2: number;
}

/** Complete game state */
interface IGameState extends ITimestamped {
    readonly id: string;
    readonly board: ReadonlyArray<ReadonlyArray<number | null>>;
    readonly size: ISize;
    readonly currentPlayer: PlayerNumber;
    readonly status: GameStatus;
    readonly scores: IGameScores;
    readonly lastMove?: IGameMove;
}

/** Move validation result */
interface IMoveValidation {
    readonly valid: boolean;
    readonly message?: string;
    readonly captures?: ReadonlyArray<IPosition>;
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
  winner?: Player | null;
  finalScore?: {
    [Player.First]: number;
    [Player.Second]: number;
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
      [Player.First]: number[];
      [Player.Second]: number[];
    };
    piecesCaptured: {
      [Player.First]: number;
      [Player.Second]: number;
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