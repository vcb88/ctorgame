# Database Structures Documentation

## Overview

The game uses a type-safe layered approach to data management with:
- Core primitive types (basic building blocks)
- Composed types (game-specific structures)
- Storage types (database-specific implementations)

The game uses a hybrid storage approach:
- MongoDB for persistent storage
- Redis for real-time state management and caching

## Core Types

### Base Enums

```typescript
enum Player {
    None = 0,
    First = 1,
    Second = 2
}

enum GamePhase {
    INITIAL = 'INITIAL',
    CONNECTING = 'CONNECTING',
    WAITING = 'WAITING',
    PLAYING = 'PLAYING',
    GAME_OVER = 'GAME_OVER',
    FINISHED = 'FINISHED',
    ERROR = 'ERROR'
}

enum WebSocketErrorCode {
    // Client errors (4xxx)
    InvalidGameCode = 4000,
    GameNotFound = 4001,
    GameFull = 4002,
    InvalidMove = 4003,
    NotYourTurn = 4004,
    InvalidOperation = 4005,
    InvalidState = 4006,
    PlayerNotFound = 4007,

    // Server errors (5xxx)
    InternalError = 5000,
    DatabaseError = 5001,
    ValidationError = 5002,
    StateError = 5003,
    NetworkError = 5004,
    
    // Generic errors
    Unknown = 9999
}
```

### Core Primitives

Basic building blocks for type composition:

```typescript
// Coordinates
interface IXCoordinate {
    readonly x: number;
}

interface IYCoordinate {
    readonly y: number;
}

// Dimensions
interface IWidth {
    readonly width: number;
}

interface IHeight {
    readonly height: number;
}

// Time
interface ITimestamp {
    readonly timestamp: number;
}

interface IExpiration {
    readonly expiresAt: number;
}

// Game elements
interface ICell {
    readonly value: number | null;
}

interface IPlayerNumber {
    readonly playerNumber: number;
}

interface IScore {
    readonly score: number;
}

// State
interface IGameStatus {
    readonly status: string;
}

interface IConnectionStatus {
    readonly status: string;
}

interface IPhase {
    readonly phase: string;
}
```

### Composed Types

Game-specific composed structures:

```typescript
interface IPosition extends IXCoordinate, IYCoordinate {}
interface IBoardSize extends IWidth, IHeight {}

interface IValidationResult {
    readonly valid: boolean;
    readonly message?: string;
}

interface IOperationType {
    readonly type: string;
}

interface IOperationCount {
    readonly count: number;
}
```

## MongoDB Collections

### Games Collection

Primary collection for storing game metadata and history.

```typescript
interface GameMetadata {
    _id: ObjectId;                // MongoDB document ID
    gameId: string;              // Unique game identifier (shared with Redis)
    code: string;                // 4-digit connection code
    status: GameStatus;          // Game status (waiting/playing/finished)
    startTime: string;           // ISO timestamp of game start
    endTime?: string;           // ISO timestamp of game end
    duration?: number;          // Game duration in seconds
    lastActivityAt: string;     // Last activity timestamp
    expiresAt: string;         // When the game expires
    players: {
        first?: string;        // First player's connection ID
        second?: string;       // Second player's connection ID
    };
    winner?: Player;           // Winner enum value if game is finished
    totalTurns: number;        // Total number of turns in the game
    currentState?: IGameState; // Current game state snapshot
    isCompleted?: boolean;    // Game completion flag
    gameOver?: boolean;       // Game over status
    currentPlayer?: Player;   // Current player's turn
    boardSize?: IBoardSize;   // Board dimensions
    finalScore?: {           // Final game scores
        [Player.First]: number;
        [Player.Second]: number;
    };
}

enum GameStatus {
    WAITING = 'waiting',    // Waiting for second player
    PLAYING = 'playing',    // Game in progress
    FINISHED = 'finished',  // Game completed
    ABANDONED = 'abandoned' // Game abandoned before completion
}

interface IBoardSize {
    width: number;  // Board width (default: 10)
    height: number; // Board height (default: 10)
}
```

### Game Details (Game History)

Detailed game statistics and move history.

```typescript
interface GameDetails {
    moves: GameMove[];           // Array of all moves in the game
    timing: {
        moveTimes: number[];    // Time taken for each move
        avgMoveTime: number;    // Average move time
    };
    territoryHistory: Array<{   // Territory ownership history
        [Player.First]: number;
        [Player.Second]: number;
    }>;
}

interface GameMove {
    player: Player;            // Player who made the move
    position: IPosition;       // Move position
    moveType: MoveType;       // Type of move (PLACE/REPLACE)
    turnNumber: number;       // Turn number when move was made
    timestamp: number;        // Move timestamp
}
```

## Redis Structures

### Game State Cache

Stores current game state for active games.

```typescript
interface IRedisGameState {
    lastUpdate: number;           // Last state update timestamp
    currentState: IGameState;     // Current game state
    metadata: GameMetadata;       // Game metadata
    events: IRedisGameEvent[];    // Recent game events
}

interface IGameState {
    board: IBoard;               // Current board state
    gameOver: boolean;           // Game over flag
    winner: Player | null;       // Winner if game is over
    currentPlayer: Player;       // Current player
    isFirstTurn: boolean;       // First turn flag
    currentTurn: ITurnState;    // Current turn state
    scores: IScores;            // Current scores
    turnNumber: number;         // Global turn counter
}
```

### Player Sessions

Tracks active player sessions.

```typescript
interface IRedisPlayerSession {
    gameId: string;          // Associated game ID
    playerNumber: number;    // Player number (1/2)
    lastActivity: number;    // Last activity timestamp
}
```

### Game Events Queue

Stores recent game events for real-time updates.

```typescript
interface IRedisGameEvent {
    gameId: string;         // Associated game ID
    type: string;          // Event type
    data: unknown;         // Event data
    timestamp: number;     // Event timestamp
}
```

## Database Configuration

### MongoDB Users and Permissions

The database uses three levels of access:

1. Root Admin User (ctorgame)
   ```javascript
   roles: [
       { role: "userAdminAnyDatabase", db: "admin" },
       { role: "readWriteAnyDatabase", db: "admin" },
       { role: "dbAdminAnyDatabase", db: "admin" }
   ]
   ```

2. Admin User (ctorgame_admin)
   ```javascript
   roles: [
       { role: "userAdmin", db: "admin" },
       { role: "dbAdmin", db: "admin" },
       { role: "readWrite", db: "admin" }
   ]
   ```

3. Application User (ctorgame)
   ```javascript
   roles: [
       { role: "readWrite", db: "ctorgame" },
       { role: "dbAdmin", db: "ctorgame" }
   ]
   ```

### MongoDB Indexes

1. Games Collection
   ```javascript
   // TTL index for automatic cleanup
   {
       createdAt: 1,
       expireAfterSeconds: 86400,
       name: "ttl_games_cleanup"
   }

   // Status lookup index
   {
       status: 1,
       name: "games_status_lookup"
   }
   ```

2. Players Collection
   ```javascript
   // TTL index for inactive players
   {
       lastActive: 1,
       expireAfterSeconds: 3600,
       name: "ttl_players_cleanup"
   }

   // Game lookup index
   {
       gameId: 1,
       name: "players_game_lookup"
   }
   ```

## TTL and Cleanup

### MongoDB TTL Indexes
- Games collection: 24-hour TTL after last activity
- Game history: 7-day TTL after game completion

### Redis TTL Strategy

TTL values vary based on game state:

1. Base TTL Values
```typescript
{
    gameState: 3600,     // 1 hour
    playerSession: 7200, // 2 hours
    gameRoom: 3600,     // 1 hour
    events: 86400       // 24 hours
}
```

2. Active Game TTL Values
```typescript
{
    gameState: 14400,    // 4 hours
    playerSession: 14400,// 4 hours
    gameRoom: 14400     // 4 hours
}
```

3. Finished Game TTL Values
```typescript
{
    gameState: 900,     // 15 minutes
    playerSession: 900, // 15 minutes
    gameRoom: 900      // 15 minutes
}
```

TTL values can be configured via environment variables:
```env
# Base TTL values
CACHE_TTL_GAME_STATE=3600
CACHE_TTL_PLAYER_SESSION=7200
CACHE_TTL_GAME_ROOM=3600
CACHE_TTL_EVENTS=86400

# Active/Finished game TTLs
CACHE_TTL_ACTIVE_GAME_STATE=14400
CACHE_TTL_FINISHED_GAME_STATE=900
```

TTL updates are triggered by:
- Game state changes
- Player activity
- Turn changes
- Game completion

## Data Flow

1. Game Creation:
   - Create MongoDB game document
   - Initialize Redis game state
   - Create player session

2. During Game:
   - State changes stored in Redis
   - Events published to Redis queue
   - Periodic state snapshots to MongoDB
   - Player activity updates session TTL

3. Game Completion:
   - Final state saved to MongoDB
   - Game details archived
   - Redis state marked for cleanup

## Implementation Notes

- All timestamps stored in ISO format in MongoDB
- Redis timestamps stored as UNIX timestamps
- MongoDB ObjectId used for internal references
- Game IDs are UUIDv4 strings
- Connection codes are 4-digit strings
- Player IDs are session-based connection IDs

## Usage Examples

### Game Creation

```typescript
// 1. Create MongoDB game document
const gameMetadata: GameMetadata = {
    gameId: 'uuid-v4-string',
    code: '1234',             // 4-digit code
    status: GameStatus.WAITING,
    startTime: new Date().toISOString(),
    lastActivityAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    players: { first: 'player-connection-id' },
    totalTurns: 0,
    boardSize: { width: 10, height: 10 }
};

// 2. Initialize Redis state
const redisGameState: IRedisGameState = {
    lastUpdate: Date.now(),
    currentState: {
        board: createEmptyBoard(10, 10),
        gameOver: false,
        winner: null,
        currentPlayer: Player.First,
        isFirstTurn: true,
        currentTurn: {
            moves: [],
            count: 0,
            placeOperationsLeft: 1,
            replaceOperationsLeft: 0
        },
        scores: {
            [Player.First]: 0,
            [Player.Second]: 0,
            player1: 0,
            player2: 0
        },
        turnNumber: 0
    },
    metadata: gameMetadata
};
```

### Game Move

```typescript
// 1. Record move in Redis events
const gameEvent: IRedisGameEvent = {
    gameId: 'game-id',
    type: 'MOVE',
    data: {
        player: Player.First,
        position: { x: 3, y: 4 },
        moveType: 'PLACE',
        turnNumber: 1,
        timestamp: Date.now()
    },
    timestamp: Date.now()
};

// 2. Add move to game history
const gameDetails: GameDetails = {
    moves: [
        {
            player: Player.First,
            position: { x: 3, y: 4 },
            moveType: 'PLACE',
            turnNumber: 1,
            timestamp: Date.now()
        }
    ],
    timing: {
        moveTimes: [1500], // milliseconds
        avgMoveTime: 1500
    },
    territoryHistory: [
        {
            [Player.First]: 1,
            [Player.Second]: 0
        }
    ]
};
```

### Game Completion

```typescript
// 1. Update MongoDB document
const gameUpdate = {
    status: GameStatus.FINISHED,
    endTime: new Date().toISOString(),
    duration: 300, // seconds
    winner: Player.First,
    gameOver: true,
    isCompleted: true,
    finalScore: {
        [Player.First]: 35,
        [Player.Second]: 28
    }
};

// 2. Update Redis TTL
await ttlStrategy.updateGameTTLs(gameId, 'finished');
```

## Notes

1. Data Structure Relationships
   - GameMetadata: Primary game information
   - IGameState: Current game state
   - GameDetails: Game history and statistics
   - IRedisGameState: Real-time game data
   
2. Implementation Considerations
   - Use type guards for data validation
   - Keep Redis state minimal
   - Archive game history after completion
   - Clean up expired data regularly

3. MVP Focus
   - Focus on essential game features
   - Minimize complexity while maintaining reliability
   - Document known limitations
   - Keep documentation in sync with implementation

Last updated: January 14, 2025